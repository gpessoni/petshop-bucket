export default function Field({ label, full = false, children }) {
  return <label className={`field ${full ? "full" : ""}`}><span>{label}</span>{children}</label>;
}
