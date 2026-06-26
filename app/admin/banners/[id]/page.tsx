"use client"

import { useParams } from "next/navigation"
import BannerForm from "@/components/banner-form"

export default function EditBannerPage() {
  const { id } = useParams()

  return (
    <BannerForm
      mode="edit"
      bannerId={id as string}
    />
  )
}