const GUIDES = [
  {
    url: `https://youtube.com`,
    title: "YouTube",
  },
  {
    url: `https://github.com`,
    title: "GitHub",
  },
];

const AppGuides: React.FC = () => {
  return (
    <>
      <h2>Listowanie</h2>
      <p>
        Text
      </p>
      {GUIDES.map((guide) => {
        return (
          <li key={guide.title} className="d-flex align-items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-arrow-right-circle-fill me-2"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
            </svg>
            <a href={guide.url} target="_blank" rel="noopener">
              {guide.title}
            </a>
          </li>
        );
      })}
    </>
  );
};

export default AppGuides;
