import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Trash2, PlusCircle, Edit, Circle, CircleCheck } from "lucide-react";

// Constants outside component
const MAX_OPTIONS = 10;
const EMPTY_OPTION = { text: "", isCorrect: false };
const VALIDATION_MESSAGES = {
  ALL_OPTIONS_FILLED: "All existing options must be filled before adding new ones",
  MAX_OPTIONS_REACHED: `Maximum of ${MAX_OPTIONS} options allowed`
};

const Checkbox = ({ questionData, index, onQuestionChange, addQuestion }) => {
  const [question, setQuestion] = useState(questionData);
  const [isEdit, setIsEdit] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Memoized validation function
  const validateCanAddOption = useCallback((options) => {
    if (options.length >= MAX_OPTIONS) {
      return { isValid: false, error: VALIDATION_MESSAGES.MAX_OPTIONS_REACHED };
    }
    
    const hasEmptyOptions = options.some(option => !option.text?.trim());
    return hasEmptyOptions 
      ? { isValid: false, error: VALIDATION_MESSAGES.ALL_OPTIONS_FILLED }
      : { isValid: true };
  }, []);

  // Memoized option adder with validation
  const addOption = useCallback(() => {
    setQuestion(prev => {
      const validation = validateCanAddOption(prev.options);
      if (!validation.isValid) {
        setValidationError(validation.error);
        setTimeout(() => setValidationError(null), 3000);
        return prev;
      }
      return {
        ...prev,
        options: [...prev.options, EMPTY_OPTION]
      };
    });
  }, [validateCanAddOption]);

  // Propagate changes to parent
  useEffect(() => {
    onQuestionChange(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? question : item)
    }));
  }, [question, index, onQuestionChange]);

  // Memoized option click handler
  const handleOptionClick = useCallback((optionIndex) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => {
        if (i === optionIndex) {
          return {
        ...opt,
        isCorrect: !opt.isCorrect
      }
        }
        return opt})
    }));
  }, []);
  const handleOptionBlur = useCallback((e, optionIndex)=>{
    const validation = validateCanAddOption(question.options)
    
    if (!e.target.value && !validation.isValid) {
      setValidationError(validation.error);
      setTimeout(() => {
        setValidationError(null)
        removeOption(optionIndex)
      }, 3000);
    }
  }, []);

  // Memoized option removal
  const removeOption = useCallback((optionIndex) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== optionIndex)
    }));
  }, []);

  // Memoized question input handler
  const handleQuestionChange = useCallback((e) => {
    setQuestion(prev => ({ ...prev, question: e.target.value }));
  }, []);

  // Memoized option input handler
  const handleOptionChange = useCallback((optionIndex, value) => {
    setQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === optionIndex ? { ...opt, text: value } : opt
      )
    }));
  }, []);

  // Memoized option list rendering
  const renderedOptions = useMemo(() => 
    question.options.map((option, optionIndex) => (
      <div key={optionIndex} className="flex items-center gap-2">
        <input
          type="text"
          value={option.text}
          onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
          onBlur={(e)=> handleOptionBlur(e, optionIndex)}
          disabled={isEdit}
          placeholder={`Option ${optionIndex + 1}`}
          className={`flex-1 p-2 border rounded-md outline-none transition-[border] focus:border-blue-500 ${
            isEdit && option.isCorrect ? "border-green-500" : ""
          }`}
        />
        <div className={`flex gap-2 transition-[width] duration-300 ${
          isEdit ? "opacity-100 w-15" : "opacity-0 w-0"
        }`}>
          <div className="relative">
            <Circle
              tabIndex={0}
              role="button"
              aria-label="Select option"
              className={`transition-opacity duration-300 text-gray-400 focus:outline-none ${
                option.isCorrect ? "opacity-0" : "opacity-100"
              }`}
              onClick={() => handleOptionClick(optionIndex)}
            />
            <CircleCheck
              tabIndex={0}
              role="button"
              aria-label="Mark as correct"
              className={`cursor-pointer transition-opacity duration-300 absolute top-0 right-0 focus:outline-none ${
                option.isCorrect
                  ? "text-green-500 opacity-100"
                  : "text-gray-400 opacity-0"
              }`}
              onClick={() => handleOptionClick(optionIndex)}
            />
          </div>
          <Trash2
            className="text-red-500 cursor-pointer hover:text-red-600 transition-colors"
            onClick={() => removeOption(optionIndex)}
          />
        </div>
      </div>
    )),
    [question.options, isEdit, handleOptionChange, handleOptionClick, removeOption]
  );

  return (
    <div className="p-4 rounded-xl bg-white shadow-md border border-gray-200 w-full">
      <textarea
        value={question.question}
        onChange={handleQuestionChange}
        placeholder="Enter your question..."
        className="w-full p-2 text-lg border-b border-gray-300 focus:border-blue-500 outline-none resize-none"
      />
      
      <div className="mt-4 space-y-2">
        {renderedOptions}
      </div>

      {validationError && (
        <div className="mt-2 text-red-500 text-sm">{validationError}</div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={addOption}
          className="flex items-center gap-1 mt-3 text-neutral-600 hover:text-neutral-500 font-medium cursor-pointer select-none"
        >
          <PlusCircle size={18} /> Add Option
        </button>
        <Edit
          size={18}
          onClick={() => setIsEdit(prev => !prev)}
          className={`flex items-center gap-1 mt-3 font-medium cursor-pointer ${
            isEdit ? "text-green-500 hover:text-green-400" : "text-neutral-600 hover:text-neutral-500"
          }`}
        />
      </div>

      {index === questionData.length - 1 && (
        <button
          onClick={addQuestion}
          className="mt-4 w-full p-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
        >
          Add Question
        </button>
      )}
    </div>
  );
};

export default React.memo(Checkbox);