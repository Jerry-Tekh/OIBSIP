import styles from "./ApiDataPanel.module.css";

export default function ApiDataPanel({ title, method, endpoint, request, response, note }) {
  return (
    <details className={styles.panel}>
      <summary>
        <span className={styles.eyebrow}>MOCK API EXCHANGE</span>
        <strong>{title}</strong>
        <span className={styles.method}>{method}</span>
        <code>{endpoint}</code>
        <span className={styles.toggle}>View request &amp; response ↓</span>
      </summary>
      <div className={styles.content}>
        {note && <p className={styles.note}>{note}</p>}
        {request !== undefined && <section><h4>Request sent by frontend</h4><pre>{JSON.stringify(request, null, 2)}</pre></section>}
        <section><h4>Response expected from backend</h4><pre>{JSON.stringify(response, null, 2)}</pre></section>
      </div>
    </details>
  );
}
