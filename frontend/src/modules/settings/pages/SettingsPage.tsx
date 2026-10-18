import { Save } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { getShopSettings, saveShopSettings } from '../data/shopSettings'
import type { ShopSettings } from '../types'

export function SettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(getShopSettings)
  const [saved, setSaved] = useState(false)

  const update = (field: keyof ShopSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveShopSettings(settings)
    setSaved(true)
  }

  return (
    <form className="settings-page" onSubmit={handleSubmit}>
      <div className="page-heading"><div><h1>Shop Settings</h1><p>Basic shop information manage karein.</p></div><button className="button button--primary" type="submit"><Save size={17} /> Save settings</button></div>
      {saved && <div className="form-notice" role="status"><strong>Settings saved.</strong> Shop name sidebar aur barcode labels par update ho gaya.</div>}

      <section className="panel settings-panel">
        <div className="section-heading"><h2>Shop information</h2><p>Ye public business details hain; passwords aur private keys yahan store nahi hoti.</p></div>
        <div className="form-grid">
          <label className="form-field">Shop name<input value={settings.shopName} onChange={(event) => update('shopName', event.target.value)} placeholder="Shop name" required /></label>
          <label className="form-field">Owner name<input value={settings.ownerName} onChange={(event) => update('ownerName', event.target.value)} placeholder="Owner name" required /></label>
          <label className="form-field">Phone number<input value={settings.phone} onChange={(event) => update('phone', event.target.value)} placeholder="03XX XXXXXXX" required /></label>
          <label className="form-field">City<input value={settings.city} onChange={(event) => update('city', event.target.value)} placeholder="City" required /></label>
          <label className="form-field form-field--wide">Shop address<textarea value={settings.address} onChange={(event) => update('address', event.target.value)} placeholder="Complete shop address" rows={3} required /></label>
        </div>
      </section>
    </form>
  )
}
