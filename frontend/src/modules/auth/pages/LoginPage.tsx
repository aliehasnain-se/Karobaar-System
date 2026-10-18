import { ArrowRight, Eye, LockKeyhole, UserRound } from 'lucide-react'
import { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate('/')
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <div className="brand-mark brand-mark--light">K</div>
          <strong>Karobaar</strong>
        </div>
        <div className="story-copy">
          <p className="eyebrow eyebrow--light">Wholesale fabric management</p>
          <h1>Stock aur accounts, ek jagah.</h1>
          <p>Fabric rolls, sales aur customer balances ka simple record.</p>
        </div>
        <div className="story-stat">
          <span>01</span>
          <p>Secure access for the shop owner.</p>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to Karobaar</h2>
          <p className="muted">Use your owner account.</p>

          <label>
            Username
            <span className="input-wrap">
              <UserRound size={18} />
              <input required defaultValue="owner" autoComplete="username" />
            </span>
          </label>

          <label>
            Password
            <span className="input-wrap">
              <LockKeyhole size={18} />
              <input required type="password" defaultValue="password" autoComplete="current-password" />
              <Eye size={18} />
            </span>
          </label>

          <button className="button button--primary login-submit" type="submit">
            Sign in <ArrowRight size={18} />
          </button>
          <small className="login-note">Demo frontend: koi real credentials use nahi ho rahe.</small>
        </form>
      </section>
    </main>
  )
}

