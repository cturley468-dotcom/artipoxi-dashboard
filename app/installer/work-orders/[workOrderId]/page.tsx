"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getCurrentProfile } from "../../../lib/auth";

type WorkOrder = {
  id: string;
  title: string | null;
  description: string | null;
  status: "Open" | "In Progress" | "Completed";
};

type Photo = {
  id: string;
  photo_url: string;
};

export default function WorkOrderDetailPage() {
  const { workOrderId } = useParams();
  const router = useRouter();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);

  // 🔐 Load job
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("work_orders")
        .select("*")
        .eq("id", workOrderId)
        .single();

      setWorkOrder(data);

      const { data: photoData } = await supabase
        .from("work_order_photos")
        .select("*")
        .eq("work_order_id", workOrderId);

      setPhotos(photoData || []);
    }

    load();
  }, [workOrderId]);

  // 🔄 Update job status
  async function updateStatus(status: WorkOrder["status"]) {
    await supabase
      .from("work_orders")
      .update({ status })
      .eq("id", workOrderId);

    setWorkOrder((prev) => prev ? { ...prev, status } : prev);
  }

  // 📸 Upload photo
  async function handleUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const profile = await getCurrentProfile();

    const filePath = `${workOrderId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("work-order-photos")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("work-order-photos")
      .getPublicUrl(filePath);

    await supabase.from("work_order_photos").insert({
      work_order_id: workOrderId,
      uploaded_by: profile?.id,
      photo_url: urlData.publicUrl,
      photo_path: filePath,
    });

    setPhotos((prev) => [
      ...prev,
      { id: Date.now().toString(), photo_url: urlData.publicUrl },
    ]);

    setUploading(false);
  }

  if (!workOrder) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <main className="p-6 text-white">
      <h1 className="text-3xl font-bold">{workOrder.title}</h1>

      <p className="text-zinc-400 mt-2">{workOrder.description}</p>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => updateStatus("In Progress")}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Start Job
        </button>

        <button
          onClick={() => updateStatus("Completed")}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Complete Job
        </button>
      </div>

      <div className="mt-8">
        <label className="block mb-2">Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {photos.map((photo) => (
          <img
            key={photo.id}
            src={photo.photo_url}
            className="rounded"
          />
        ))}
      </div>
    </main>
  );
}
