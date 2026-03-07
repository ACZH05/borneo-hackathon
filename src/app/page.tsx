import ButtonListComponent from "./components/home/ButtonListComponent";
import EmergencyDetailsComponent from "./components/home/EmergencyDetailsComponent";
import LatestAlert from "./components/home/LatestAlert";

export default function HomePage() {
  return (
    <div className="grid grid-cols-4 grid-rows-4 gap-x-4 gap-y-8 p-8">
      <div className="flex flex-col gap-8 col-span-2 row-span-2">
        <div className="text-6xl font-bold">
          Together for a <br />
          <span>Resilient Borneo</span>
        </div>

        <div className="">
          Connecting rural residents with life-saving resources, trusted shelter
          information, and community support during emergencies.
        </div>

        <ButtonListComponent />

        <EmergencyDetailsComponent />
      </div>
      <div className="col-span-2 row-span-2 col-start-3 bg-blue-50">2</div>
      <div className="col-span-3 row-span-2 row-start-3">
        <LatestAlert />
      </div>
      <div className="col-start-4 row-start-3 bg-yellow-50">4</div>
      <div className="col-start-4 row-start-4 bg-purple-50">5</div>
    </div>
  );
}
