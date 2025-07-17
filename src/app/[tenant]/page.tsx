import { notFound } from 'next/navigation'
import { getTenantBySubdomain } from '@/lib/supabase/tenants'
import HotelRestaurantTemplate from '@/components/templates/HotelRestaurantTemplate'
import RealEstateTemplate from '@/components/templates/RealEstateTemplate'
import CarDealershipTemplate from '@/components/templates/CarDealershipTemplate'
import BeautySalonTemplate from '@/components/templates/BeautySalonTemplate'
import MedicalClinicTemplate from '@/components/templates/MedicalClinicTemplate'
import TechShopTemplate from '@/components/templates/TechShopTemplate'
import LawFirmTemplate from '@/components/templates/LawFirmTemplate'
import HardwareStoreTemplate from '@/components/templates/HardwareStoreTemplate'

interface PageProps {
  params: Promise<{
    tenant: string
  }>
}

export default async function TenantPublicSite({ params }: PageProps) {
  const { tenant: subdomain } = await params;
  // Get tenant data from database
  const tenant = await getTenantBySubdomain(subdomain)
  
  if (!tenant) {
    notFound()
  }

  // Route to appropriate template based on industry
  const templates = {
    hotel_restaurant: HotelRestaurantTemplate,
    real_estate: RealEstateTemplate,
    car_dealership: CarDealershipTemplate,
    beauty_salon: BeautySalonTemplate,
    medical_clinic: MedicalClinicTemplate,
    tech_shop: TechShopTemplate,
    law_firm: LawFirmTemplate,
    hardware_store: HardwareStoreTemplate,
  }

  const Template = templates[tenant.industry_type as keyof typeof templates]
  
  if (!Template) {
    notFound()
  }

  return <Template tenant={tenant} />
}