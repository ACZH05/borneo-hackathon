import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";

export default function SOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-end border-b-2 pb-4 border-textGrey/10">
        <span className="text-2xl font-black">Triage Details: Ahmad Yusof</span>
        <button className="flex items-center gap-2 px-6 py-2 text-sm font-black bg-primary text-white rounded-xl">
          <MedicalServicesOutlinedIcon />
          Dispatch Medical Team
        </button>
      </div>
      {children}
    </div>
  );
}
