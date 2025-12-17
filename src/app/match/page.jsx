export default function MatchPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        Your Matches
      </h1>
      <iframe
        src="/match-ui/index.html"
        style={{
          width: "100%",
          height: "80vh",
          border: "none",
        }}
        title="Match UI"
      />
    </main>
  );
}
