"use client";

export default function ResourceMenu() {
    return (
        <div className="flex flex-col gap-10 p-10">
            <div className="flex flex-col gap-10">
                {/* --- Title --- */}
                <h1 className="text-6xl font-bold">
                    <span>Preparedness </span>
                    <span className=" text-primary">Resources</span>
                </h1>

                {/* --- Description --- */}
                <p className="text-xl text-textGrey text-justify">
                    Optimized low-bandwidth modules and emergency guides. <br />
                    These resources are designed to load quickly in limited connectivity scenarios during hazard events.
                </p>
            </div>

            {/* --- Resource Cards --- */}
            <div className="flex flex-wrap items-stretch justify-center gap-10 w-full">
                {/* --- AI Survival Simulator Card --- */}
                <div
                    onClick={() => window.location.href = "/page-resources/page-resources-simulation"}
                    className="flex flex-1 flex-col items-center justify-center gap-6 rounded-xl shadow-2xl bg-white min-w-100 p-8 active:scale-[0.96] hover:scale-[0.98] transition-transform duration-200"
                >
                    {/* --- Icon --- */}
                    <div className="flex items-center gap-2 p-4 rounded-full bg-secondary/20">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 100 }}>science</span>
                    </div>

                    {/* Text */}
                    <span className="font-extrabold text-2xl">AI Survival Simulator</span>
                    <hr className="w-full border-gray-300" />
                    <span className="text-center">Test your knowledge and decision-making in high-stakes emergency scenarios powered by advanced AI modeling.</span>

                    {/* Button */}
                    <button className="font-bold text-primary hover:underline">Start Simulation</button>
                </div>

                {/* --- Smart Emergency Checklists Card --- */}
                <div 
                    onClick={() => window.location.href = "/page-resources/page-resources-checklist"}
                    className="flex flex-1 flex-col items-center justify-center gap-6 rounded-2xl shadow-2xl bg-white min-w-100 p-8 active:scale-[0.96] hover:scale-[0.98] transition-transform duration-200"
                >
                    {/* --- Icon --- */}
                    <div className="flex items-center gap-2 p-4 rounded-full bg-secondary/20">
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: 100 }}>assignment</span>
                    </div>

                    {/* Text */}
                    <span className="font-extrabold text-2xl">Smart Emergency Checklists</span>
                    <hr className="w-full border-gray-300" />
                    <span className="text-center">Generate and manage personalized preparedness lists for your home and family based on your specific location and needs.</span>

                    {/* Button */}
                    <button className="font-bold text-primary hover:underline">Generate Checklist</button>
                </div>
            </div>
        </div>
    )
}