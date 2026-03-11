"use client";

export default function ResourceMenu() {
    return (
        <div className="flex flex-col gap-8 p-10">
            <div className="flex flex-col gap-10">
                {/* --- Title --- */}
                <h1 className="wrap-break-word text-6xl font-bold">
                    <span>Prepared </span>
                    <span className=" text-primary">Resources</span>
                </h1>

                {/* --- Description --- */}
                <p className="text-xl text-textGrey text-justify">
                    Optimized low-bandwidth modules and emergency guides. <br />
                    These resources are designed to load quickly in limited connectivity scenarios during hazard events.
                </p>
            </div>

            {/* --- Resource Cards --- */}
            <div className="grid grid-cols-1 items-stretch gap-6 w-full lg:grid-cols-2 lg:gap-10">
                {/* --- AI Survival Simulator Card --- */}
                <div
                    onClick={() => window.location.href = "/page-resources/page-resources-simulation"}
                    className="flex min-w-0 w-full flex-col items-center justify-center gap-5 rounded-xl bg-white p-5 shadow-2xl transition-transform duration-200 active:scale-[0.96] hover:scale-[0.98] sm:p-6 lg:gap-6 lg:p-8"
                >
                    {/* --- Icon --- */}
                    <div className="flex items-center gap-2 p-4 rounded-full bg-secondary/20">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 100 }}>science</span>
                    </div>

                    {/* Text */}
                    <span className="text-center text-xl font-extrabold wrap-break-word sm:text-2xl">AI Survival Simulator</span>
                    <hr className="w-full border-gray-300" />
                    <span className="text-center wrap-break-word">Test your knowledge and decision-making in high-stakes emergency scenarios powered by advanced AI modeling.</span>

                    {/* Button */}
                    <button className="font-bold text-primary hover:underline">Start Simulation</button>
                </div>

                {/* --- Smart Emergency Checklists Card --- */}
                <div 
                    onClick={() => window.location.href = "/page-resources/page-resources-checklist"}
                    className="flex min-w-0 w-full flex-col items-center justify-center gap-5 rounded-2xl bg-white p-5 shadow-2xl transition-transform duration-200 active:scale-[0.96] hover:scale-[0.98] sm:p-6 lg:gap-6 lg:p-8"
                >
                    {/* --- Icon --- */}
                    <div className="flex items-center gap-2 p-4 rounded-full bg-secondary/20">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 100 }}>assignment</span>
                    </div>

                    {/* Text */}
                    <span className="text-center text-xl font-extrabold wrap-break-word sm:text-2xl">Smart Emergency Checklists</span>
                    <hr className="w-full border-gray-300" />
                    <span className="text-center wrap-break-word">Generate and manage personalized preparedness lists for your home and family based on your specific location and needs.</span>

                    {/* Button */}
                    <button className="font-bold text-primary hover:underline">Generate Checklist</button>
                </div>
            </div>
        </div>
    )
}