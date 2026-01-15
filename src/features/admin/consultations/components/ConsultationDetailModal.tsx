'use client';

import { useState } from 'react';

import { updateConsultationMemo } from '../actions';

import { StatusBadge } from './StatusBadge';

import type { Consultation } from '../types';


interface ConsultationDetailModalProps {
    consultation: Consultation | null;
    isOpen: boolean;
    onClose: () => void;
    onMemoUpdate: (id: string, memo: string) => void;
}

export function ConsultationDetailModal({ consultation, isOpen, onClose, onMemoUpdate }: ConsultationDetailModalProps) {
    const [memo, setMemo] = useState(consultation?.memo || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !consultation) return null;

    const handleSaveMemo = async () => {
        setIsSaving(true);
        try {
            await updateConsultationMemo(consultation.id, memo);
            onMemoUpdate(consultation.id, memo);
            alert('메모가 저장되었습니다.');
        } catch (e) {
            alert('저장 실패');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">상담 신청 상세정보</h2>
                        <p className="text-sm text-gray-500 mt-1">ID: {consultation.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">진행 상태:</span>
                        <StatusBadge status={consultation.status} />
                        <span className="text-sm text-gray-400">({new Date(consultation.created_at).toLocaleString()})</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
                            <div className="text-lg font-medium">{consultation.customer_name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                            <div className="text-lg font-medium">{consultation.contact}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">희망 상담 시간</label>
                            <div className="text-lg font-medium text-blue-600">
                                {consultation.requested_at
                                    ? new Date(consultation.requested_at).toLocaleString()
                                    : '시간 지정 없음'}
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">관리자 메모</label>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
                            placeholder="상담 내용을 기록하세요..."
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveMemo}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {isSaving ? '저장 중...' : '메모 저장'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
