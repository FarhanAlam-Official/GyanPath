import {
  emailSchema,
  passwordSchema,
  ratingSchema,
  courseTitleSchema,
  commentContentSchema,
  sanitizeString,
  sanitizeHtml,
  validateFileType,
  validateFileSize,
} from "@/lib/utils/validation"
import { z } from "zod"

describe("Validation Utils", () => {
  describe("emailSchema", () => {
    it("validates correct email", () => {
      expect(() => emailSchema.parse("test@example.com")).not.toThrow()
    })

    it("rejects invalid email", () => {
      expect(() => emailSchema.parse("invalid-email")).toThrow()
    })
  })

  describe("passwordSchema", () => {
    it("validates strong password", () => {
      expect(() => passwordSchema.parse("Password123")).not.toThrow()
    })

    it("rejects weak password", () => {
      expect(() => passwordSchema.parse("weak")).toThrow()
      expect(() => passwordSchema.parse("nouppercase123")).toThrow()
      expect(() => passwordSchema.parse("NOLOWERCASE123")).toThrow()
      expect(() => passwordSchema.parse("NoNumbers")).toThrow()
    })
  })

  describe("ratingSchema", () => {
    it("validates rating in range", () => {
      expect(() => ratingSchema.parse(1)).not.toThrow()
      expect(() => ratingSchema.parse(5)).not.toThrow()
      expect(() => ratingSchema.parse(3)).not.toThrow()
    })

    it("rejects out of range rating", () => {
      expect(() => ratingSchema.parse(0)).toThrow()
      expect(() => ratingSchema.parse(6)).toThrow()
    })
  })

  describe("courseTitleSchema", () => {
    it("validates title", () => {
      expect(() => courseTitleSchema.parse("Test Course")).not.toThrow()
    })

    it("rejects empty title", () => {
      expect(() => courseTitleSchema.parse("")).toThrow()
    })

    it("rejects too long title", () => {
      expect(() => courseTitleSchema.parse("a".repeat(201))).toThrow()
    })
  })

  describe("commentContentSchema", () => {
    it("validates comment content", () => {
      expect(() => commentContentSchema.parse("Valid comment")).not.toThrow()
    })

    it("rejects empty comment", () => {
      expect(() => commentContentSchema.parse("")).toThrow()
    })

    it("rejects too long comment", () => {
      expect(() => commentContentSchema.parse("a".repeat(5001))).toThrow()
    })
  })

  describe("sanitizeString", () => {
    it("trims whitespace", () => {
      expect(sanitizeString("  test  ")).toBe("test")
    })

    it("removes HTML tags", () => {
      expect(sanitizeString("test<script>alert('xss')</script>")).toBe("testscriptalert('xss')/script")
    })

    it("normalizes whitespace", () => {
      expect(sanitizeString("test    multiple    spaces")).toBe("test multiple spaces")
    })
  })

  describe("sanitizeHtml", () => {
    it("removes script tags", () => {
      const result = sanitizeHtml("<script>alert('xss')</script>Hello")
      expect(result).not.toContain("<script>")
      expect(result).toContain("Hello")
    })

    it("removes iframe tags", () => {
      const result = sanitizeHtml("<iframe src='evil.com'></iframe>Content")
      expect(result).not.toContain("<iframe>")
      expect(result).toContain("Content")
    })

    it("removes event handlers", () => {
      const result = sanitizeHtml("<div onclick='alert(1)'>Click me</div>")
      expect(result).not.toContain("onclick")
    })
  })

  describe("validateFileType", () => {
    it("validates correct file type", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" })
      expect(validateFileType(file, ["image/jpeg", "image/png"])).toBe(true)
    })

    it("rejects invalid file type", () => {
      const file = new File(["content"], "test.exe", { type: "application/x-msdownload" })
      expect(validateFileType(file, ["image/jpeg", "image/png"])).toBe(false)
    })
  })

  describe("validateFileSize", () => {
    it("validates file within size limit", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 1024 * 1024 }) // 1MB
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(true) // 5MB limit
    })

    it("rejects file exceeding size limit", () => {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" })
      Object.defineProperty(file, "size", { value: 10 * 1024 * 1024 }) // 10MB
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(false) // 5MB limit
    })
  })
})

