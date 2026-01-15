'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';

import 'react-quill-new/dist/quill.snow.css';
import { supabaseClient } from '@/src/shared/lib/supabase/client';

// ✅ 핵심: 'as any'를 붙여서 TypeScript의 ref 타입 검사 에러를 해결
 
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
}) as any;

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
   
  const quillRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 이미지 핸들러: 이미지를 선택하면 Supabase에 업로드하고 URL을 에디터에 삽입
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      setIsUploading(true);

      try {
        // 1. Supabase Storage에 업로드 (파일명: 시간_랜덤문자열.확장자)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `content/${fileName}`;

        // ⚠️ Supabase Storage에 'events' 버킷이 있어야 합니다.
        const { error: uploadError } = await supabaseClient.storage
          .from('events')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. 업로드된 이미지의 Public URL 가져오기
        const { data: { publicUrl } } = supabaseClient.storage
          .from('events')
          .getPublicUrl(filePath);

        // 3. 에디터의 현재 커서 위치에 이미지 태그 삽입
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();

        // range가 null일 경우(포커스 잃음) 에디터 끝에 삽입
        const index = range ? range.index : editor.getLength();

        editor.insertEmbed(index, 'image', publicUrl);

        // 4. 커서를 이미지 다음으로 이동
        editor.setSelection(index + 1);

      } catch (error) {
        console.error('Image upload failed:', error);
        alert('이미지 업로드에 실패했습니다. (콘솔 확인 필요)');
      } finally {
        setIsUploading(false);
      }
    };
  };

  // 툴바 설정 (메모이제이션으로 렌더링 최적화)
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link', 'image'], // 이미지 버튼 활성화
        ['clean'],
      ],
      handlers: {
        image: imageHandler, // 커스텀 이미지 핸들러 연결
      },
    },
  }), []);

  return (
    <div className="relative">
      {/* 업로드 중일 때 로딩 오버레이 표시 */}
      {isUploading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-600 font-bold text-sm">이미지 업로드 중...</span>
          </div>
        </div>
      )}

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        className="h-96 mb-12"
      />
    </div>
  );
}