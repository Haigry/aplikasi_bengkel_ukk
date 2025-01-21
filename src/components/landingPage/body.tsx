"use client"
import React, { useState } from "react";

interface AccordionItem {
    id: string;
    title: string;
    content: React.ReactNode;
}

const accordionData: AccordionItem[] = [
    {
        id: "1",
        title: "Can I use Landwind in open-source projects?",
        content: (
            <>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                    Landwind is an open-source library of interactive components built on top of Tailwind CSS including buttons, dropdowns, modals, navbars, and more.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    Check out this guide to learn how to <a href="#" className="text-purple-600 dark:text-purple-500 hover:underline">get started</a> and start developing websites even faster with components on top of Tailwind CSS.
                </p>
            </>
        ),
    },
    // ...Add other accordion items similarly
];

const BodyLandingPage: React.FC = () => {
    const [openItem, setOpenItem] = useState<string | null>("1");

    const toggleAccordion = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="max-w-screen-xl px-4 pb-8 mx-auto lg:pb-24 lg:px-6">
                <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-center text-gray-900 lg:mb-8 lg:text-3xl dark:text-white">
                    Frequently asked questions
                </h2>
                <div className="max-w-screen-md mx-auto">
                    <div id="accordion-flush">
                        {accordionData.map((item) => (
                            <div key={item.id}>
                                <h3 id={`accordion-flush-heading-${item.id}`}>
                                    <button
                                        type="button"
                                        className={`flex items-center justify-between w-full py-5 font-medium text-left border-b border-gray-200 dark:border-gray-700 ${
                                            openItem === item.id
                                                ? "text-gray-900 dark:text-white"
                                                : "text-gray-500 dark:text-gray-400"
                                        }`}
                                        onClick={() => toggleAccordion(item.id)}
                                        aria-expanded={openItem === item.id}
                                        aria-controls={`accordion-flush-body-${item.id}`}
                                    >
                                        <span>{item.title}</span>
                                        <svg
                                            className={`w-6 h-6 shrink-0 ${openItem === item.id ? "rotate-180" : ""}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </h3>
                                <div
                                    id={`accordion-flush-body-${item.id}`}
                                    className={`${openItem === item.id ? "" : "hidden"}`}
                                    aria-labelledby={`accordion-flush-heading-${item.id}`}
                                >
                                    <div className="py-5 border-b border-gray-200 dark:border-gray-700">
                                        {item.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BodyLandingPage;