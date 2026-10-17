import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'

type ModulePlaceholderProps = {
  title: string
  description: string
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon"><Construction size={30} /></div>
      <p className="eyebrow">Next module</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link className="button button--secondary" to="/">
        <ArrowLeft size={17} /> Back to dashboard
      </Link>
    </section>
  )
}

