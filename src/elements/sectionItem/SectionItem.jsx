import "./SectionItem.css";
const SectionItem = ({ label, children }) => {
  return (
    <div className="sectionItem">
      <div className="sectionItemTitle">{label}</div>
      <div className="sectionItemContent">{children}</div>
    </div>
  );
};
export default SectionItem;
