import React, { useState, useEffect, useCallback, useRef } from "react";
import { PlusCircle, ChevronDown, List, Trash2 } from "lucide-react";

// Constants outside component
const MAX_OPTIONS = 10;
const VALIDATION_MESSAGES = {
  ALL_OPTIONS_FILLED:
    "All existing options must be filled before adding new ones",
  MAX_OPTIONS_REACHED: `Maximum of ${MAX_OPTIONS} options allowed`,
  ALREADY_SELECTED: "You already selected this option!",
  BLANK_INPUT: "Your input is empty!",
};

const WordBank = ({ questionData, index, onQuestionChange, addQuestion }) => {
  const [question, setQuestion] = useState(questionData);
  const [isEdit, setIsEdit] = useState({
    remove: false,
    addToCorrect: false,
  });
  const [validationError, setValidationError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const newOptionRef = useRef(null);
  // Memoized validation function
  const validateCanAddOption = useCallback(
    (options, MAX_LENGTH) =>
      options.length >= MAX_LENGTH
        ? { isValid: false, error: VALIDATION_MESSAGES.MAX_OPTIONS_REACHED }
        : { isValid: true },
    []
  );

  // Memoized option adder with validation
  const addOption = useCallback(
    (newOption) => {
      setQuestion((prev) => {
        const validation = validateCanAddOption(prev.options, MAX_OPTIONS);
        if (!validation.isValid) {
          setValidationError(validation.error);
          setTimeout(() => setValidationError(null), 3000);
          return prev;
        }
        return {
          ...prev,
          options: [...prev.options, newOption],
        };
      });
    },
    [validateCanAddOption]
  );

  // Propagate changes to parent
  useEffect(() => {
    onQuestionChange((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? question : item)),
    }));
  }, [question, index, onQuestionChange]);
  useEffect(() => {
    setIsEdit({
      remove: false,
      addToCorrect: false,
    });
  }, [isOpen]);
  useEffect(() => {
    setQuestion(questionData)
  }, [questionData]);

  // Memoized option removal
  const removeOption = useCallback(
    (optionIndex) => {
      const correctOptionsSet = new Set(question.correctAnswerOrder);

      if (correctOptionsSet.has(question.options[optionIndex])) {
        setQuestion((prev) => {
          return {
            ...prev,
            correctAnswerOrder: prev.correctAnswerOrder.filter(
              (item) => item !== prev.options[optionIndex]
            ),
            options: prev.options.filter((_, i) => i !== optionIndex),
          };
        });
        return;
      }
      setQuestion((prev) => {
        return {
          ...prev,
          options: prev.options.filter((_, i) => i !== optionIndex),
        };
      });
    },
    [question]
  );
  // Memoized correct option removal
  const removeCorrectOption = useCallback(
    (optionIndex) =>
      setQuestion((prev) => ({
        ...prev,
        correctAnswerOrder: prev.correctAnswerOrder.filter(
          (_, i) => i !== optionIndex
        ),
      })),
    []
  );
  // Memoized correct answer option adding
  const addToCorrectOptions = useCallback(
    (item) => {
      const correctAnswerOrderSet = new Set(question.correctAnswerOrder);
      console.log(correctAnswerOrderSet);
      if (correctAnswerOrderSet.has(item)) {
        setValidationError(VALIDATION_MESSAGES.ALREADY_SELECTED);
        setTimeout(() => setValidationError(null), 3000);
        return;
      }
      setQuestion((prev) => ({
        ...prev,
        correctAnswerOrder: [...prev.correctAnswerOrder, item],
      }));
    },
    [question]
  );

  const handleEdit = useCallback((item) => {
    const newIsEdit = { remove: false, addToCorrect: false };
    setIsEdit((prev) => {
      newIsEdit[item] = !prev[item];
      return { ...newIsEdit };
    });
  }, []);

  // Memoized question input handler
  const handleQuestionChange = useCallback((e) => {
    setQuestion((prev) => ({ ...prev, question: e.target.value }));
  }, []);

  const handleDragStart = useCallback((e, item) => {
    e.dataTransfer.setData("text/plain", item);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const draggedItem = e.dataTransfer.getData("text/plain");
    const correctAnswerOrderSet = new Set(question.correctAnswerOrder);
    if (correctAnswerOrderSet.has(draggedItem)) {
      setValidationError(VALIDATION_MESSAGES.ALREADY_SELECTED);
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    setQuestion((prev) => {
      return {
        ...prev,
        correctAnswerOrder: [...prev.correctAnswerOrder, draggedItem],
      };
    });
  }, []);

  return (
    <div className="p-4 rounded-xl bg-white shadow-md border border-gray-200 w-full transition-all">
      <textarea
        value={question.question}
        onChange={handleQuestionChange}
        placeholder="Enter your question..."
        className="w-full p-2 text-lg border-b border-gray-300 focus:border-blue-500 outline-none resize-none"
      />

      <div>
        <sub className="text-neutral-500">All options</sub>
        <div className="flex gap-2 my-4 flex-wrap transition-all">
          {question.options.map((option, optionIndex) => (
            <p
              draggable={!isOpen}
              onDragStart={(e) => handleDragStart(e, option)}
              key={optionIndex}
              onClick={() => {
                if (isEdit.remove) {
                  removeOption(optionIndex);
                }
                if (isEdit.addToCorrect) {
                  addToCorrectOptions(option);
                }
              }}
              className={`border px-3 font-medium text-neutral-700 rounded transition-all select-none ${
                isOpen ? "cursor-pointer" : "cursor-grab"
              }`}
            >
              {option}
            </p>
          ))}
        </div>
        {(validationError == VALIDATION_MESSAGES.ALREADY_SELECTED || validationError == VALIDATION_MESSAGES.BLANK_INPUT) && (
          <div className="mt-2 text-red-500 text-sm">{validationError}</div>
        )}
      </div>

      <form className="flex gap-4 items-center justify-center">
        <input
          type="text"
          ref={newOptionRef}
          placeholder={`Enter Option...`}
          className={`flex-1 px-2 py-1 border rounded-md outline-none transition-[border] focus:outline-none`}
        />
        <button
          onClick={(e) => {
            e.preventDefault()
            if (newOptionRef.current.value) {
              addOption(newOptionRef.current.value);
              newOptionRef.current.value = "";
              return;
            }
            setValidationError(VALIDATION_MESSAGES.BLANK_INPUT);
            setTimeout(() => setValidationError(null), 3000);
            return;
          }}
          className="flex items-center gap-1 border border-blue-500 text-white py-1 px-2 rounded bg-blue-600 hover:bg-blue-500  cursor-pointer select-none"
        >
          <PlusCircle size={18} /> Add Option
        </button>
      </form>

      {(validationError !== VALIDATION_MESSAGES.ALREADY_SELECTED && validationError !== VALIDATION_MESSAGES.BLANK_INPUT) && (
        <div className="mt-2 text-red-500 text-sm">{validationError}</div>
      )}
      <sub className="text-neutral-500">Correct options</sub>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex gap-2 mt-2 flex-wrap border transition-all p-2 border-neutral-400 rounded"
      >
        {question.correctAnswerOrder.length ? (
          question.correctAnswerOrder.map((item, index) => (
            <div
              onClick={() => isEdit.remove && removeCorrectOption(index)}
              key={item + index}
              className="border gap-2 flex items-center justify-center rounded px-2 select-none"
            >
              <span className=" text-neutral-400 text-sm">{index + 1}</span>
              <p className="font-medium text-neutral-700 rounded transition-all cursor-pointer ">
                {item}
              </p>
            </div>
          ))
        ) : (
          <p className="text-neutral-400 pl-2 py-0.5">
            Drag and Drop correct options here ...
          </p>
        )}
      </div>
      <div
        className={`flex flex-col transition-all duration-300 ${
          isOpen ? "opacity-100 min-h-20 py-4" : "opacity-0 h-0"
        }`}
      >
        <button
          onClick={() => handleEdit("remove")}
          className={`flex items-center gap-1 mt-3 font-medium cursor-pointer select-none ${
            isEdit.remove && isOpen
              ? "text-red-500 hover:text-red-600"
              : "text-neutral-600 hover:text-neutral-500"
          }`}
        >
          <Trash2 size={18} /> Delete Option
        </button>
        <button
          onClick={() => handleEdit("addToCorrect")}
          className={`flex items-center gap-1 mt-3 font-medium cursor-pointer select-none ${
            isEdit.addToCorrect && isOpen
              ? "text-green-500 hover:text-green-600"
              : "text-neutral-600 hover:text-neutral-500"
          }`}
        >
          <List size={18} /> Select correct options (order matters)
        </button>
      </div>
      <div
        className="flex items-center justify-center cursor-pointer mt-2 hover:bg-neutral-100"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ChevronDown
          className={`font-medium transform ${
            isOpen
              ? "text-green-500 hover:text-green-400 rotate-180"
              : "text-neutral-600 hover:text-neutral-500"
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

export default React.memo(WordBank);
