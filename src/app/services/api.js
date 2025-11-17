// TODO: Replace these with your real VM IPs + ports
const ATOMIC_BASE_URL = "http://YOUR-ATOMIC-IP:PORT";
const COMPOSITE_BASE_URL = "http://YOUR-COMPOSITE-IP:PORT";

// Example: GET call to atomic microservice
export async function fetchAtomic() {
  const res = await fetch(`${ATOMIC_BASE_URL}/resource`, {
    method: "GET",
  });
  return res.json();
}

// Example: POST call to composite microservice
export async function sendCompositeData(payload) {
  const res = await fetch(`${COMPOSITE_BASE_URL}/composite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}
