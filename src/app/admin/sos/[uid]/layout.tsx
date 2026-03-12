import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AlertButton from "./components/AlertButton";

export default async function SOSLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  return (
    <div className="">
      <div className="flex justify-between items-end border-b-2 pb-4 border-textGrey/10 p-6">
        <span className="text-2xl font-black">Triage Details</span>
        <div className="flex gap-4">
          <AlertButton uid={uid} />
          <button className="flex items-center gap-2 px-6 py-2 text-sm font-black bg-primary text-white rounded-xl">
            <MedicalServicesOutlinedIcon />
            Dispatch Medical Team
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
