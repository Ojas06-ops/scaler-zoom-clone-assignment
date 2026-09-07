import { Suspense } from "react";
import MeetingRoom from "@/components/MeetingRoom";

export default async function MeetingRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-[#2D8CFF] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-400">Loading meeting room...</p>
        </div>
      }
    >
      <MeetingRoom meetingCode={id} />
    </Suspense>
  );
}
