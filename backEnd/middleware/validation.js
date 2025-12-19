const Joi = require("joi");

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).trim().required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),
    email: Joi.string().email().trim().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
    }),
    role: Joi.string().valid("student", "instructor").optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),

  applyInstructor: Joi.object({
    bio: Joi.string().min(10).max(1000).trim().required().messages({
      "string.empty": "Bio is required",
      "string.min": "Bio must be at least 10 characters",
      "string.max": "Bio cannot exceed 1000 characters",
    }),
    specialization: Joi.string().min(3).max(200).trim().required().messages({
      "string.empty": "Specialization is required",
      "string.min": "Specialization must be at least 3 characters",
      "string.max": "Specialization cannot exceed 200 characters",
    }),
    documents: Joi.array()
      .items(
        Joi.object({
          type: Joi.string()
            .valid("certificate", "id_proof", "professional_document", "other")
            .required(),
          filename: Joi.string().required(),
          originalName: Joi.string().required(),
          url: Joi.string().uri().required(),
          size: Joi.number().min(1).max(10485760).required(), // Max 10MB per file
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "At least one document is required",
      }),
  }),

  approveInstructorApplication: Joi.object({
    approved: Joi.boolean().required().messages({
      "any.required": "Approval status is required",
    }),
    rejectionReason: Joi.string()
      .max(500)
      .trim()
      .optional()
      .when("approved", {
        is: false,
        then: Joi.required().messages({
          "any.required":
            "Rejection reason is required when rejecting application",
        }),
        otherwise: Joi.optional(),
      }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().trim().required().messages({
      "string.email": "Please provide a valid email",
      "string.empty": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      "string.empty": "Reset token is required",
    }),
    password: Joi.string().min(6).max(128).required().messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 128 characters",
    }),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).trim().optional().messages({
      "string.min": "Name must be at least 2 characters",
      "string.max": "Name cannot exceed 50 characters",
    }),
    bio: Joi.string().max(500).trim().optional().allow("").messages({
      "string.max": "Bio cannot exceed 500 characters",
    }),
    specialization: Joi.string().max(100).trim().optional().allow("").messages({
      "string.max": "Specialization cannot exceed 100 characters",
    }),
    phone: Joi.string()
      .trim()
      .optional()
      .allow("")
      .pattern(/^(\+20|0)?1[0-2,5]\d{8}$/)
      .messages({
        "string.pattern.base":
          "Invalid Egyptian phone number. Use format: +201012345678 or 01012345678",
      }),
  }),
  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      "string.empty": "Current password is required",
    }),
    newPassword: Joi.string().min(6).max(128).required().messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters",
      "string.max": "New password cannot exceed 128 characters",
    }),
  }),

  deleteAccount: Joi.object({
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),

  createCourse: Joi.object({
    title: Joi.string().min(3).max(100).trim().required().messages({
      "string.empty": "Course title is required",
      "string.min": "Title must be at least 3 characters",
      "string.max": "Title cannot exceed 100 characters",
    }),
    description: Joi.string().min(10).max(2000).trim().required().messages({
      "string.empty": "Course description is required",
      "string.min": "Description must be at least 10 characters",
      "string.max": "Description cannot exceed 2000 characters",
    }),
    category: Joi.string()
      .valid(
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Data Science",
        "Personal Development",
        "Health & Fitness",
        "Language",
        "Academic",
        "Other"
      )
      .required()
      .messages({
        "string.empty": "Category is required",
      }),
    level: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .required()
      .messages({
        "string.empty": "Level is required",
      }),
    price: Joi.number().min(0).required().messages({
      "number.base": "Price must be a number",
      "number.min": "Price cannot be negative",
      "any.required": "Price is required",
    }),
    thumbnail: Joi.string().uri().optional().allow("").messages({
      "string.uri": "Thumbnail must be a valid URL",
    }),
    previewVideo: Joi.string().uri().optional().allow("").messages({
      "string.uri": "Preview video must be a valid URL",
    }),
    language: Joi.string().default("English"),
    duration: Joi.number().min(1).required().messages({
      "number.base": "Duration must be a number",
      "number.min": "Duration must be at least 1 minute",
      "any.required": "Duration is required",
    }),
    lessons: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().min(3).max(100).trim().required(),
          description: Joi.string().max(500).trim().optional(),
          videoUrl: Joi.string().uri().required(),
          duration: Joi.number().min(1).required(),
          order: Joi.number().min(1).required(),
          isPreview: Joi.boolean().default(false),
          resources: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                url: Joi.string().uri().required(),
                type: Joi.string()
                  .valid("pdf", "doc", "link", "other")
                  .default("other"),
              })
            )
            .default([]),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "Course must have at least one lesson",
      }),
    requirements: Joi.array().items(Joi.string().max(200)).default([]),
    whatYouWillLearn: Joi.array().items(Joi.string().max(200)).default([]),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
  }),

  updateCourse: Joi.object({
    title: Joi.string().min(3).max(100).trim().optional(),
    description: Joi.string().min(10).max(2000).trim().optional(),
    category: Joi.string()
      .valid(
        "Programming",
        "Design",
        "Business",
        "Marketing",
        "Photography",
        "Music",
        "Data Science",
        "Personal Development",
        "Health & Fitness",
        "Language",
        "Academic",
        "Other"
      )
      .optional(),
    level: Joi.string()
      .valid("Beginner", "Intermediate", "Advanced")
      .optional(),
    price: Joi.number().min(0).optional(),
    thumbnail: Joi.string().uri().allow("").optional(),
    previewVideo: Joi.string().uri().allow("").optional(),
    language: Joi.string().optional(),
    duration: Joi.number().min(1).optional(),
    lessons: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().min(3).max(100).trim().required(),
          description: Joi.string().max(500).trim().optional(),
          videoUrl: Joi.string().uri().required(),
          duration: Joi.number().min(1).required(),
          order: Joi.number().min(1).required(),
          isPreview: Joi.boolean().default(false),
          resources: Joi.array()
            .items(
              Joi.object({
                name: Joi.string().required(),
                url: Joi.string().uri().required(),
                type: Joi.string()
                  .valid("pdf", "doc", "link", "other")
                  .default("other"),
              })
            )
            .default([]),
        })
      )
      .optional(),
    requirements: Joi.array().items(Joi.string().max(200)).optional(),
    whatYouWillLearn: Joi.array().items(Joi.string().max(200)).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    status: Joi.string().valid("draft", "published", "archived").optional(),
  }),

  addReview: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      "number.base": "Rating must be a number",
      "number.min": "Rating must be at least 1",
      "number.max": "Rating cannot exceed 5",
      "any.required": "Rating is required",
    }),
    comment: Joi.string().max(1000).trim().optional().allow(""),
  }),
};

// Validation middleware factory
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({ message: "Validation schema not found" });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    // Replace request body with validated and sanitized data
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
