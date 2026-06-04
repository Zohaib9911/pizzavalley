"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923005558706"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.25)";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="30"
        height="30"
        fill="white"
      >
        <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.472 2.027 7.774L0 32l8.476-2.001A15.934 15.934 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.773-1.852l-.485-.288-5.03 1.187 1.266-4.896-.317-.503A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.273-9.92c-.398-.2-2.355-1.162-2.72-1.294-.364-.133-.63-.2-.895.2-.265.398-1.028 1.294-1.26 1.561-.233.265-.464.298-.862.1-.398-.2-1.682-.62-3.203-1.977-1.184-1.057-1.982-2.362-2.215-2.76-.232-.398-.025-.613.175-.811.179-.178.398-.464.597-.697.2-.232.265-.398.398-.664.133-.265.066-.497-.033-.697-.1-.2-.895-2.157-1.226-2.953-.323-.776-.65-.67-.895-.683-.232-.012-.497-.015-.762-.015-.265 0-.696.1-1.061.497-.364.398-1.393 1.361-1.393 3.318 0 1.957 1.426 3.847 1.625 4.113.2.265 2.806 4.283 6.8 6.007.95.41 1.692.655 2.27.838.954.304 1.822.261 2.508.158.765-.114 2.355-.963 2.688-1.894.332-.93.332-1.727.232-1.894-.1-.165-.364-.265-.762-.464z" />
      </svg>
    </a>
  );
}
