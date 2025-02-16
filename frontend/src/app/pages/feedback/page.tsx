"use client";

import { useState } from "react";
import { useSearchParams } from 'next/navigation';

export default function FeedbackForm() {
  const [title, setTitle] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams();
  const userId= searchParams.get('personnel_id');

  const handleSubmit = async () => {
    if (!title || !feedback) {
      setMessage("Both fields are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/create-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: title, content: feedback, personnel_id: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      setMessage("Feedback submitted successfully!");
      setTitle("");
      setFeedback("");
    } catch (error) {
      setMessage("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Floor Feedback Form</h2>

        {/* Title Input */}
        <label className="block text-gray-700 text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          placeholder="Enter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-black"
        />

        {/* Feedback Input */}
        <label className="block text-gray-700 text-sm font-medium mb-1">Feedback</label>
        <textarea
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={5}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-black"
        ></textarea>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full mt-4 py-2 rounded-lg font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>

        {/* Message Display */}
        {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}
