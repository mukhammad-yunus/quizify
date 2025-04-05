import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  PlusCircle,
  Grip,
  ChevronsLeftRight,
} from "lucide-react";
import EditElement from "./EditElement";
import TextareaAutosize from "react-textarea-autosize";

// Constants outside component
const MAX_OPTIONS = 10;
const VALIDATION_MESSAGES = {
  ALL_OPTIONS_FILLED:
    "All existing options must be filled before adding new ones",
  MAX_OPTIONS_REACHED: `Maximum of ${MAX_OPTIONS} options allowed`,
  ALREADY_SELECTED: "You already selected this option!",
  BLANK_INPUT: "Your input is empty!",
};

const Matching = ({ questionData, index, onQuestionChange, addQuestion }) => {
  const [question, setQuestion] = useState(questionData);
  const [category, setCategory] = useState(questionData.columns.prompts);
  const [options, setOptions] = useState(questionData.columns.choices);
  const [isEdit, setIsEdit] = useState({
    remove: false,
    addToCorrect: false,
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const [matchings, setMatchings] = useState({
    promptIndex: null,
    choiceIndex: null,
    matchings: question.correctMatches?.length
      ? question.correctMatches
      : Array.from(Array(category.length), (_, (i) => i)),
  });
  const [validationError, setValidationError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Memoized validation function
  const validateCanAddOption = useCallback((options) => {
    if (options.length >= MAX_OPTIONS) {
      return { isValid: false, error: VALIDATION_MESSAGES.MAX_OPTIONS_REACHED };
    }

    const hasEmptyOptions = options.some((option) => !option.trim());
    return hasEmptyOptions
      ? { isValid: false, error: VALIDATION_MESSAGES.ALL_OPTIONS_FILLED }
      : { isValid: true };
  }, []);

  // Memoized row adder with validation
  const addRow = useCallback(() => {
    const validation = validateCanAddOption(category, MAX_OPTIONS);
    if (!validation.isValid) {
      setValidationError(validation.error);
      setTimeout(() => setValidationError(null), 3000);
      return;
    }
    setCategory((prev) => [...prev, ""]);
    setOptions((prev) => [...prev, ""]);
    setMatchings((prev) => ({
      ...prev,
      matchings: [...prev.matchings, prev.matchings.length],
    }));
  }, [validateCanAddOption, category]);

  // Memoized row removal
  const removeRow = useCallback(
    (promptIndex) => {
      setCategory((prev) => {
        prev.splice(promptIndex, 1);
        return prev.length ? [...prev] : [""];
      });
      setOptions((prev) => {
        prev.splice(promptIndex, 1);

        return prev.length ? [...prev] : [""];
      });
    },
    [category]
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

  const handleDragStart = (e, index) => {
    setDraggedItem(options[index]);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;

    setDragOverIndex(index);
    
  };

  const handleDragEnd = () => {
    const draggedIndex = options.indexOf(draggedItem);

    if (draggedIndex === index) return;

    const newItems = [...options];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setOptions(newItems);
    setDraggedItem(null);
    setDragOverIndex(-1);
  };

  // Propagate changes to parent
  useEffect(() => {
    onQuestionChange((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? question : item)),
    }));
  }, [question, onQuestionChange]);

  // Propagate changes to isEdit
  useEffect(() => {
    setIsEdit({
      remove: false,
      addToCorrect: false,
    });
  }, [isOpen]);

  // Propagate changes to local question
  useEffect(() => {
    setTimeout(() => {
      setQuestion((prev) => ({
        ...prev,
        columns: {
          prompts: category,
          choices: options,
        },
      }));
    }, 1000);
  }, [category, options]);
  useEffect(() => {
    if (
      Number.isInteger(matchings.promptIndex) &&
      Number.isInteger(matchings.choiceIndex)
    ) {
      const newOptions = [...options];
      newOptions[matchings.promptIndex] = options[matchings.choiceIndex];
      newOptions[matchings.choiceIndex] = options[matchings.promptIndex];
      setTimeout(() => {
        setOptions(newOptions);
        setMatchings((prev) => ({
          ...prev,
          promptIndex: null,
          choiceIndex: null,
        }));
      }, 200);
    }
  }, [matchings]);

  const renderCategoryAndOptions = useMemo(
    () =>
      category.map((prompt, promptIndex) => (
        <li
          className={`flex gap-2 group rounded ${
            isEdit.remove && "hover:bg-red-400 cursor-pointer"
          }`}
        >
          <div
            className={`flex flex-col justify-center items-center p-2 border w-1/2 rounded border-neutral-200  ${
              isEdit.remove && "group-hover:border-red-400"
            }`}
          >
            <TextareaAutosize
              spellCheck={false}
              value={prompt}
              className={`block resize-none border focus:outline-none px-2 w-full border-neutral-400 rounded  ${
                isEdit.remove
                  ? "group-hover:bg-red-50 group-hover:border-red-200 cursor-pointer"
                  : isEdit.addToCorrect
                  ? "cursor-pointer hover:bg-gray-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => {
                if (isEdit.remove) removeRow(promptIndex);
              }}
              onChange={(e) => {
                const text = e.target.value;
                setCategory((prev) => {
                  const newCategory = [...prev];
                  newCategory[promptIndex] = text;
                  return newCategory;
                });
              }}
            />
          </div>
          <div
            className={`flex flex-col justify-center items-center p-2 border w-1/2 rounded border-neutral-200  ${
              isEdit.remove && "group-hover:border-red-400"
            }`}
          >
            <TextareaAutosize
              spellCheck={false}
              value={options[promptIndex]}
              className={`block resize-none border focus:outline-none px-2 w-full border-neutral-400 rounded hover:bg-gray-50 ${
                isEdit.remove
                  ? "group-hover:bg-red-50 group-hover:border-red-200 cursor-pointer"
                  : isEdit.addToCorrect
                  ? "cursor-pointer"
                  : ""
              }`}
              onChange={(e) => {
                const text = e.target.value;
                setOptions((prev) => {
                  const newOptions = [...prev];
                  newOptions[promptIndex] = text;
                  return newOptions;
                });
              }}
            />
          </div>
        </li>
      )),
    [category, options, isEdit]
  );

  return (
    <div className="p-4 rounded-xl bg-white shadow-md border border-gray-200 w-full transition-all">
      <textarea
        value={question.question}
        onChange={handleQuestionChange}
        placeholder="Enter your question..."
        className="w-full p-2 text-lg border-b border-gray-300 focus:border-blue-500 outline-none resize-none"
      />

      <div className="flex flex-col gap-2 relative">
        <div
          className={
            isEdit.addToCorrect
              ? "invisible opacity-0 h-0"
              : "h-auto transition-all duration-300"
          }
        >
          <sub className="text-neutral-600">Creating</sub>
          <div className="border rounded border-neutral-400 p-2">
            <div class="w-full border-separate border-spacing-2 mb-6">
              <ul className="flex font-semibold">
                <li class="w-1/2">Category</li>
                <li class="w-1/2">Options</li>
              </ul>
              <ul className="flex flex-col gap-1">
                {renderCategoryAndOptions}
              </ul>
            </div>
            <button
              onClick={() => addRow()}
              className="flex items-center gap-1 m-2 border border-blue-500 text-white py-1 px-2 rounded bg-blue-600 hover:bg-blue-500  cursor-pointer select-none"
            >
              <PlusCircle size={18} /> Add Row
            </button>
          </div>
        </div>
        <div className={
            isEdit.addToCorrect
            ? "h-auto transition-all duration-300"
            : "invisible opacity-0 h-0"
          }>
          <sub className="text-neutral-600">Matching</sub>
          <div className="border rounded border-neutral-400 p-2 w-full">
            <ul className="flex font-semibold">
              <li class="w-1/2">Category</li>
              <li class="w-1/2">Options</li>
            </ul>
            <ul className="flex flex-col gap-1">
              {matchings.matchings.map((matching, i_) => (
                <li className="flex gap-2">
                  <button
                    className={`flex  items-center p-2 w-1/2 rounded text-left cursor-pointer border ${
                      matchings.promptIndex === i_
                        ? "bg-green-300 text-neutral-700 border-green-300"
                        : "bg-white text-neutral-800 border-neutral-400"
                    }`}
                    onClick={() => {
                      setMatchings((prev) => ({ ...prev, promptIndex: i_ }));
                    }}
                  >
                    {category[i_]}
                  </button>
                  <ChevronsLeftRight size={20} className="self-center" />
                  <button
                    draggable
                    onDragOver={(e) => handleDragOver(e, matching)}
                    onDragLeave={() => setDragOverIndex(-1)}
                    onDragEnd={handleDragEnd}
                    onDragStart={(e) => handleDragStart(e, matching)}
                    className={`relative group p-2 w-1/2 rounded flex justify-between items-center cursor-pointer border ${
                      matchings.choiceIndex === matching
                        ? "bg-green-300 text-neutral-700 border-green-300"
                        : "bg-white text-neutral-800 border-neutral-400"
                    }
                    ${dragOverIndex === matching && "opacity-75"}
                    `}
                    onClick={(e) => {
                      setMatchings((prev) => ({
                        ...prev,
                        choiceIndex: matching,
                      }));
                    }}
                  >
                    <p className="w-full text-left">{options[matching]}</p>
                    <Grip size={20} className="absolute  right-2 invisible text-neutral-500 cursor-grab group-hover:visible " />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <EditElement
        isEdit={isEdit}
        handleEdit={handleEdit}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectText={"Select correct matchings"}
      />
    </div>
  );
};

export default React.memo(Matching);
