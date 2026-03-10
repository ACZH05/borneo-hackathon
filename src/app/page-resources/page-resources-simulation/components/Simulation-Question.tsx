"use client";

import { useState, useEffect } from "react";

interface QuizData {
    scenario: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
}

interface SimulationQuestionProps {
    hazardType: string;
    setIsSimulating: (value: boolean) => void;
}

export default function SimulationQuestion({ hazardType, setIsSimulating }: SimulationQuestionProps) {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    {/* --- Get Question From AI --- */}
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);

                const response = await fetch("/api/ai/quiz", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ hazardType, region: "Borneo" }),
                });

                if (!response.ok) throw new Error("Failed to fetch quiz");

                const data = await response.json();
                setQuiz(data.quiz);
                
                /*
                // --- TEMPORARY DEMO DATA FOR UI STYLING ---
                const mockData: QuizData = {
                    scenario: "Heavy monsoon rains have caused the nearby river to overflow its banks rapidly. The water level has reached your front porch and is rising by the minute. Local authorities have just issued an immediate evacuation order for your area.",
                    options: [
                        "Move valuable items to the second floor and wait for rescue.",
                        "Immediately grab your pre-packed emergency kit and evacuate to higher ground.",
                        "Try to drive your car out of the neighborhood before the roads flood completely.",
                        "Stay indoors, turn off the main electricity switch, and call emergency services."
                    ],
                    correctOptionIndex: 1,
                    explanation: "In a rapid flooding situation with an active evacuation order, your immediate priority is personal safety. Grabbing your emergency kit and moving to higher ground immediately is the safest action. Driving through floodwaters is extremely dangerous (vehicles can be swept away in just 12 inches of water), and waiting for rescue can leave you trapped."
                };
                setTimeout(() => {setQuiz(mockData);}, 1000);
                */

                setLoading(false);
            } catch (err) {
                setError("Failed to load simulation. Please try again.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [hazardType]);

    const handleOptionClick = (index: number) => {
        if (showResult) return;
        setSelectedOption(index);
    };

    const handleSubmit = () => {
        if (selectedOption === null) return;
        setShowResult(true);
    };

    const handleRestart = () => {
        setIsSimulating(false);
    };

    {/* --- Loading State --- */}
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                <p className="text-gray-600 font-semibold">Generating Simulation Scenario...</p>
            </div>
        );
    }

    {/* --- Error State --- */}
    if (error || !quiz) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4 h-full">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: 64 }}>error</span>
                <p className="text-red-600 font-semibold">{error}</p>
                <button 
                    onClick={handleRestart}
                    className="py-2 px-6 bg-primary text-white rounded-full font-semibold active:scale-95 transition-transform"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const isCorrect = selectedOption === quiz.correctOptionIndex;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Simulation</h1>
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">emergency</span>
                    <span className="font-semibold capitalize">{hazardType} Scenario</span>
                </div>
            </div>

            {/* Scenario */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-8">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center justify-start gap-3">
                        <span className="material-symbols-outlined text-red-500">warning</span>
                        <h2 className="text-xl font-bold text-red-800">Critical Situation</h2>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed text-justify">{quiz.scenario}</p>
                </div>
            </div>

            {/* Options */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">What would you do?</h3>
                <div className="space-y-4">
                    {quiz.options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const isCorrectOption = index === quiz.correctOptionIndex;
                        
                        let borderColor = "";
                        let bgColor = "bg-white";
                        let textColor = "text-gray-800";
                        
                        if (showResult) {
                            if (isCorrectOption) {
                                borderColor = "border-green-500";
                                bgColor = "bg-green-50";
                                textColor = "text-green-800";
                            } else if (isSelected && !isCorrectOption) {
                                borderColor = "border-red-500";
                                bgColor = "bg-red-50";
                                textColor = "text-red-800";
                            }
                        } else if (isSelected) {
                            borderColor = "border-primary";
                            bgColor = "bg-primary/5";
                        }

                        return (
                            <div
                                key={index}
                                onClick={() => handleOptionClick(index)}
                                className={`p-4 border-2 ${borderColor} ${bgColor} rounded-lg transition-all duration-200 ${
                                    !showResult ? "cursor-pointer hover:shadow-md active:scale-[0.99]" : ""
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Option Icon */}
                                    <div className={`flex items-center justify-center ${bgColor}`}>
                                        {showResult && isCorrectOption ? (
                                            <span className="material-symbols-outlined text-green-600" style={{ fontSize: "2rem" }}>check_circle</span>
                                        ) : showResult && isSelected && !isCorrectOption ? (
                                            <span className="material-symbols-outlined text-red-600" style={{ fontSize: "2rem" }}>cancel</span>
                                        ) : (
                                            <span className={`flex shrink-0 items-center justify-center rounded-full border-2 border-gray-300 w-8 h-8 font-bold ${textColor}`}>{index + 1}</span>
                                        )}
                                    </div>

                                    {/* Option Content */}
                                    <p className={`text-justify font-semibold ${textColor}`}>{option}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit Button */}
            {!showResult && (
                <div className="flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null}
                        className={`py-3 px-8 rounded-full font-bold transition-all duration-300 ${
                            selectedOption !== null
                                ? "bg-primary text-white active:scale-95 hover:shadow-lg"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                    >
                        Submit Answer
                    </button>
                </div>
            )}

            {/* Result and Explanation */}
            {showResult && (
                <div className="space-y-6">
                    {/* Explanation */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
                        <div className="flex flex-col items-start gap-3">
                            {/* Explaination Icon */}
                            <div className="flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-blue-600">info</span>
                                <h4 className="text-lg font-bold text-blue-800">Explanation</h4>
                            </div>

                            {/* Explaination Content */}
                            <p className="text-gray-700 text-justify leading-relaxed">{quiz.explanation}</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={handleRestart}
                            className="py-3 px-8 bg-primary text-white rounded-full font-bold active:scale-95 transition-transform hover:shadow-lg"
                        >
                            Try Another Scenario
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
