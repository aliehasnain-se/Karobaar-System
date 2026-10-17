import type { Fabric, FabricRoll } from '../types'

export const initialFabrics: Fabric[] = [
  { id: 1, name: 'Wash & Wear Premium', article: 'WW-101', category: 'Wash & Wear', brand: 'Classic Textiles', colors: 4, rolls: 18, totalMeters: 1384 },
  { id: 2, name: 'Cotton Soft Finish', article: 'CT-205', category: 'Cotton', brand: 'Noor Fabrics', colors: 6, rolls: 24, totalMeters: 1820 },
  { id: 3, name: 'Boski Gold', article: 'BK-310', category: 'Boski', brand: 'Pak Loom', colors: 3, rolls: 9, totalMeters: 690 },
  { id: 4, name: 'Khaddar Winter', article: 'KD-118', category: 'Khaddar', brand: 'Punjab Mills', colors: 5, rolls: 16, totalMeters: 1208 },
  { id: 5, name: 'Linen Plain', article: 'LN-440', category: 'Linen', brand: 'Noor Fabrics', colors: 4, rolls: 12, totalMeters: 895 },
]

export const inventoryRolls: FabricRoll[] = [
  { id: 1, barcode: '890101000128', rollNumber: 'R-0128', fabric: 'Wash & Wear Premium', article: 'WW-101', color: 'Navy Blue', originalMeters: 82.5, remainingMeters: 82.5, branch: 'Lahore Main', status: 'Available' },
  { id: 2, barcode: '890101000127', rollNumber: 'R-0127', fabric: 'Cotton Soft Finish', article: 'CT-205', color: 'White', originalMeters: 76, remainingMeters: 76, branch: 'Lahore Main', status: 'Available' },
  { id: 3, barcode: '890101000126', rollNumber: 'R-0126', fabric: 'Boski Gold', article: 'BK-310', color: 'Cream', originalMeters: 80, remainingMeters: 80, branch: 'Faisalabad', status: 'Available' },
  { id: 4, barcode: '890101000125', rollNumber: 'R-0125', fabric: 'Khaddar Winter', article: 'KD-118', color: 'Charcoal', originalMeters: 74.5, remainingMeters: 18.5, branch: 'Rawalpindi', status: 'Low stock' },
  { id: 5, barcode: '890101000124', rollNumber: 'R-0124', fabric: 'Linen Plain', article: 'LN-440', color: 'Beige', originalMeters: 78, remainingMeters: 78, branch: 'Lahore Main', status: 'In transit' },
  { id: 6, barcode: '890101000123', rollNumber: 'R-0123', fabric: 'Cotton Soft Finish', article: 'CT-205', color: 'Sky Blue', originalMeters: 81, remainingMeters: 81, branch: 'Faisalabad', status: 'Available' },
]

