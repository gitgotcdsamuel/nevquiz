// src/components/exam/QuestionRenderer.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface QuestionRendererProps {
  question: any;
  index: number;
  value?: any;
  onChange?: (value: any) => void;
}

export default function QuestionRenderer({
  question,
  index,
  value = {},
  onChange,
}: QuestionRendererProps) {
  const [selected, setSelected] = useState<string | string[]>(
    question.type === 'mcq_multiple' || question.type === 'MULTIPLE_CHOICE_MULTIPLE'
      ? value?.selectedOptions || []
      : value?.selectedOption || value || ''
  );

  const [textAnswer, setTextAnswer] = useState<string>(
    typeof value?.answerText === 'string' ? value.answerText : typeof value === 'string' ? value : ''
  );

  useEffect(() => {
    if (!onChange) return;

    if (question.type === 'mcq' || question.type === 'boolean') {
      onChange(selected);
    } else {
      const trimmed = String(textAnswer ?? '').trim();
      onChange(trimmed || undefined);
    }
  }, [selected, textAnswer, question.type, onChange]);

  const options = React.useMemo(() => {
    if (!question.options) return [];
    try {
      return typeof question.options === 'string'
        ? JSON.parse(question.options)
        : Array.isArray(question.options)
        ? question.options
        : [];
    } catch {
      console.warn('Invalid options for question', question.id);
      return [];
    }
  }, [question.options]);

  const isMcq = question.type === 'mcq';
  const isBoolean = question.type === 'boolean';
  const isMultiSelect = question.type === 'mcq_multiple' || question.type === 'MULTIPLE_CHOICE_MULTIPLE';

  const handleSelect = (option: string) => {
    if (isMcq || isBoolean) {
      setSelected(option);
    } else if (isMultiSelect) {
      setSelected((prev: string | string[]) =>
        Array.isArray(prev)
          ? prev.includes(option)
            ? prev.filter((o) => o !== option)
            : [...prev, option]
          : [option]
      );
    }
  };

  const isOptionSelected = (option: string) =>
    Array.isArray(selected) ? selected.includes(option) : selected === option;

  // ────────────────────────────────────────────────
  // ALWAYS render question text first
  // ────────────────────────────────────────────────
  const questionText = question.question || question.questionText || 'Question text missing';

  return (
    <div className="question-container border rounded-xl p-6 mb-6 bg-white shadow-sm">
      {/* Question Header */}
      <div className="question-header flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            <span className="ml-3 text-sm font-normal text-gray-500">
              ({question.points || question.marks || '?'} marks)
            </span>
          </h3>
          {question.topic && (
            <span className="inline-block mt-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {question.topic}
            </span>
          )}
        </div>

        <span className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full">
          {question.type?.replace(/_/g, ' ') || 'Question'}
        </span>
      </div>

      {/* ALWAYS show question text */}
      <div className="question-content mb-8">
        <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap font-medium">
          {questionText}
        </p>

        {question.imageUrl && (
          <div className="mt-4">
            <img
              src={question.imageUrl}
              alt="Question visual"
              className="max-w-full h-auto rounded-lg border shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Answer Section */}
      <div className="answer-section">
        {(isMcq || isBoolean) && options.length > 0 ? (
          <div className="space-y-3">
            {options.map((option: string, idx: number) => {
              const letter = isBoolean ? '' : String.fromCharCode(65 + idx) + ') ';
              const checked = isOptionSelected(option);

              return (
                <label
                  key={idx}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    checked
                      ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                      : 'hover:bg-gray-50 border-gray-300'
                  }`}
                >
                  <input
                    type={isMultiSelect ? 'checkbox' : 'radio'}
                    name={`q-${question.id}-${index}`}
                    checked={checked}
                    onChange={() => handleSelect(option)}
                    className={`h-5 w-5 ${
                      isMultiSelect
                        ? 'rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        : 'rounded-full border-gray-300 text-blue-600 focus:ring-blue-500'
                    }`}
                  />
                  <span className="ml-4 text-gray-800 font-medium">
                    {letter}{option}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[160px] resize-y text-gray-800"
              rows={question.type === 'explain' ? 8 : 5}
              placeholder={
                question.type === 'explain'
                  ? 'Explain your answer in detail...'
                  : 'Type your answer here...'
              }
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
            />
            <div className="mt-2 text-right text-sm text-gray-500">
              Characters: {textAnswer.length}
            </div>
          </div>
        )}
      </div>

      {/* Optional selected feedback */}
      {Array.isArray(selected) && selected.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-green-800 font-medium">
              Selected: {Array.isArray(selected) ? selected.join(', ') : selected}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}