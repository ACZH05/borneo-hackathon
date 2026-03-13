export default function SimulationHeader() {
    return (
        <div className="flex flex-col items-center justify-center gap-10">
            {/* --- Title --- */}
            <h1 className="text-6xl font-bold">
                <span>AI Survival </span>
                <span className=" text-primary">Simulator</span>
            </h1>

            {/* --- Description --- */}
            <p className="text-xl text-textGrey text-justify">
                Test your knowledge and decision-making in high-stakes emergency scenarios powered by advanced AI modeling.
            </p>
        </div>
    )
}