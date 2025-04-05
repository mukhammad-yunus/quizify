import { components } from ".";
// The logic for the Validator is written by an AI. Later this should be reviewed.

export const Validators = {
  string: () => {
    const validator = {
      validate(value) {
        if (typeof value === "string") return { success: true };
        return { success: false, error: "Must be a string" };
      },
      optional() {
        const prevValidate = this.validate;
        this.validate = (value) => {
          if (value === undefined) return { success: true };
          return prevValidate(value);
        };
        return this;
      },
      max(maxLength) {
        const prevValidate = this.validate;
        this.validate = (value) => {
          const result = prevValidate(value);
          if (!result.success) return result;
          if (value.length > maxLength)
            return {
              success: false,
              error: `Exceeds max length of ${maxLength}`,
            };
          return { success: true };
        };
        return this;
      },
      min(minLength) {
        const prevValidate = this.validate;
        this.validate = (value) => {
          const result = prevValidate(value);
          if (!result.success) return result;
          if (value.length < minLength)
            return {
              success: false,
              error: `Below min length of ${minLength}`,
            };
          return { success: true };
        };
        return this;
      },
    };
    return validator;
  },

  number: () => {
    const validator = {
      validate(value) {
        if (typeof value === "number") return { success: true };
        return { success: false, error: "Must be a number" };
      },
      optional() {
        const prevValidate = this.validate;
        this.validate = (value) => {
          if (value === undefined) return { success: true };
          return prevValidate(value);
        };
        return this;
      },
      max(maxValue) {
        const prevValidate = this.validate;
        this.validate = (value) => {
          const result = prevValidate(value);
          if (!result.success) return result;
          if (value > maxValue)
            return {
              success: false,
              error: `Exceeds max value of ${maxValue}`,
            };
          return { success: true };
        };
        return this;
      },
      min(minValue) {
        const prevValidate = this.validate;
        this.validate = (value) => {
          const result = prevValidate(value);
          if (!result.success) return result;
          if (value < minValue)
            return { success: false, error: `Below min value of ${minValue}` };
          return { success: true };
        };
        return this;
      },
    };
    return validator;
  },

  boolean: () => {
    const validator = {
      validate(value) {
        if (typeof value === "boolean") return { success: true };
        return { success: false, error: "Must be a boolean" };
      },
      optional() {
        const prevValidate = this.validate;
        this.validate = (value) => {
          if (value === undefined) return { success: true };
          return prevValidate(value);
        };
        return this;
      },
    };
    return validator;
  },

  array: (itemValidator) => {
    const validator = {
      validate(value) {
        if (!Array.isArray(value))
          return { success: false, error: "Must be an array" };
        for (let i = 0; i < value.length; i++) {
          const result = itemValidator.validate(value[i]);
          if (!result.success)
            return { success: false, error: `Index ${i}: ${result.error}` };
        }
        return { success: true };
      },
      optional() {
        const prevValidate = this.validate;
        this.validate = (value) => {
          if (value === undefined) return { success: true };
          return prevValidate(value);
        };
        return this;
      },
    };
    return validator;
  },

  object: (schema) => {
    const validator = {
      validate(data) {
        if (typeof data !== "object" || data === null)
          return { success: false, error: "Must be an object" };

        const errors = {};
        let hasErrors = false;

        // Validate schema fields
        for (const key in schema) {
          const result = schema[key].validate(data[key]);
          if (!result.success) {
            errors[key] = result.error;
            hasErrors = true;
          }
        }

        // Check for extra fields
        for (const key in data) {
          if (!(key in schema)) {
            errors[key] = "Unexpected field";
            hasErrors = true;
          }
        }

        return hasErrors
          ? { success: false, error: errors }
          : { success: true, data };
      },
    };
    return validator;
  },
};

const similarParts = {
  isGradeable: Validators.boolean(),
  point: Validators.number().min(0), // if isGradeable false, then point should be zero
  explanation: Validators.string().optional(),
}

export const questionTemplates = {
  multipleChoice: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    options: Validators.array(
      Validators.object({
        text: Validators.string().min(1).max(200),
        isCorrect: Validators.boolean(),
      })
    ),
    ...similarParts,
  }),
  checkbox: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    options: Validators.array(
      Validators.object({
        text: Validators.string().min(1).max(200),
        isCorrect: Validators.boolean(),
      })
    ),
    ...similarParts,
  }),
  wordBank: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    options: Validators.array(Validators.string().min(1)),
    correctAnswerOrder: Validators.array(Validators.string().min(1)),
    ...similarParts,
  }),
  matching: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    columns: Validators.object({
      prompts: Validators.array(Validators.string().min(1)),
      choices: Validators.array(Validators.string().min(1)),
    }),
    correctMatches: Validators.array(Validators.number().min(0)),
    ...similarParts,
  }),
  shortAnswer: Validators.object({
    question: Validators.string().min(1),
  }),
  longAnswer: Validators.object({
    question: Validators.string().min(1),
  }),
  fillInTheBlank: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    correctAnswers: Validators.array(Validators.string().min(1)),
    caseSensitive: Validators.boolean(),
    ...similarParts,
  }),
  sentenceScramble: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    scrambled: Validators.array(Validators.string().min(1)),
    correctAnswer: Validators.array(Validators.string().min(1)),
    ...similarParts,
  }),
  spotTheMistake: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    mistakes: Validators.array(Validators.string().min(1)),
    correctAnswers: Validators.array(Validators.string().min(1)),
    ...similarParts,
  }),
  sentenceCompletion: Validators.object({
    question: Validators.string(), //Later I'll add max char, e.g. max(500)
    options: Validators.array(Validators.string().min(1)),
    correctAnswer: Validators.string().min(1),
    ...similarParts,
  }),
};

export const validating = (data) => {
  const output = {
    succeeded: [],
    failed: []
  }
  for (let i = 0; i < data.length; i++) {
    const element = data[i];
    const {type} = element
    if (!(type in components)) {
      output.failed.push({questionNumber:i+1, error: {type: "wrong type"}})
      continue
    }
    delete element.type
    const id = Math.random().toString(36).slice(2)
    const validator = questionTemplates[type]
    const result = validator.validate(element)
    if (result.success) {
      output.succeeded.push({...data[i], id, type})
    } else{
      output.failed.push({questionNumber:i+1, error: result.error})
    }
    
  }
  return output
};
