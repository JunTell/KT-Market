'use client';

import { useState } from 'react';

import { updateApplicationMemo } from '../actions';

import { StatusBadge } from './StatusBadge';

import type { Application } from '../types';


interface ApplicationDetailModalProps {
    application: Application | null;
    isOpen: boolean;
    onClose: () => void;
    onMemoUpdate: (id: string, memo: string) => void;
}

export function ApplicationDetailModal({ application, isOpen, onClose, onMemoUpdate }: ApplicationDetailModalProps) {
    const [memo, setMemo] = useState(application?.memo || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen || !application) return null;

    // Sync memo state when application prop updates
    if (application && memo !== application.memo && !isSaving) {
        // One-way sync logic would be better in useEffect but for simple modal this is handled by key/mount usually
        // For now, we rely on parent mounting it or useEffect inside
    }

    const handleSaveMemo = async () => {
        setIsSaving(true);
        try {
            await updateApplicationMemo(application.id, memo);
            onMemoUpdate(application.id, memo);
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
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">신청서 상세정보</h2>
                        <p className="text-sm text-gray-500 mt-1">ID: {application.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">진행 상태:</span>
                        <StatusBadge status={application.status} />
                        <span className="text-sm text-gray-400">({new Date(application.created_at).toLocaleString()})</span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
                            <div className="text-lg font-medium">{application.customer_name}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                            <div className="text-lg font-medium">{application.contact}</div>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Product Detail JSON View */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">신청 상품 정보</h3>
                        <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap border border-gray-200">
                            {application.product_info
                                ? JSON.stringify(application.product_info, null, 2)
                                : <span className="text-gray-400">상품 상세 정보 없음</span>
                            }
                        </div>
                    </div>

                    {/* Admin Memo */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">관리자 메모</label>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow"
                            placeholder="특이사항이나 상담 내용을 기록하세요..."
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
