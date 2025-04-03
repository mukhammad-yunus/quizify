import React, { useRef, useState, useReducer, useMemo, useId } from "react";
import { validating } from "../utils/validate";
import { Link } from "react-router";
import { useDebounce } from "use-debounce";

const initialState = {
  isSuccess: false,
  isLoading: false,
  isWrongInput: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true, isWrongInput: false };
    case "SUCCESS":
      return { ...state, isLoading: false, isSuccess: true };
    case "ERROR":
      return { ...state, isLoading: false, isWrongInput: true };
    case "INPUT":
      return { ...state, isLoading: false, isSuccess: false };
    default:
      return state;
  }
};

const GenerateFromJSON = ({ onDisplay, onSuccess, onFail }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [inputValue, setInputValue] = useState("");
  const [debouncedInput] = useDebounce(inputValue, 300);

  const parsedData = useMemo(() => {
    dispatch({ type: "INPUT" });
    try {
      return JSON.parse(debouncedInput);
    } catch (error) {
      return null;
    }
  }, [debouncedInput]);

  const handleGenerate = () => {
    dispatch({ type: "LOADING" });
    try {
      if (!parsedData) throw new Error("Invalid JSON! Check syntax.");
      const output = validating(parsedData);
      const {succeeded, failed} = output
      onSuccess(prev=> ({...prev, items: [...prev.items, ...succeeded]}))
      onFail(failed)
      dispatch({ type: "SUCCESS" });
      onDisplay(false);
    } catch (err) {
      dispatch({ type: "ERROR" });
      console.error(err);
    }
  };

  return (
    <div className="backdrop-blur-[1px] fixed top-0 bottom-0 left-0 right-0 transition">
      <div className="bg-white flex flex-col justify-between gap-4 absolute top-0 bottom-0 left-0 right-0 m-10 p-4 border border-neutral-400 rounded">
        <div className="flex flex-col h-full gap-3">
          <div className="flex gap-1 flex-wrap">
            <p>If you are new to this,</p>
            <Link to="/tutorial/json">click here!</Link>
          </div>
          <textarea
            name="jsonInput"
            id="jsonInput"
            className="border h-full block rounded resize-none p-2 font-mono disabled:border-red-500"
            placeholder="Copy and paste the JSON format"
            spellCheck={false}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={state.isLoading}
          />
          {state.isWrongInput && (
            <p className="text-red-500">Invalid JSON format.</p>
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            onClick={handleGenerate}
            className="bg-neutral-500 text-neutral-50 rounded py-0.5 px-3 transition hover:bg-neutral-600 cursor-pointer select-none"
            disabled={state.isLoading}
          >
            {state.isLoading ? "Loading..." : "Generate"}
          </button>
          <button
            className="bg-red-500 text-neutral-50 rounded py-0.5 px-3 transition hover:bg-red-400 cursor-pointer"
            onClick={() => onDisplay(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GenerateFromJSON);
