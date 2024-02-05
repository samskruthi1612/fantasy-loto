import { withHoverText } from "../../../hoc/withHoverText"
import styles from './StatusWithHoverText.module.css'

export const StatusWithHoverText = ({statusText, variant, hoverText, width}) => {
  
    const Element = withHoverText(
    <div 
        className={`${styles.statusText} ${variant==='active'?styles.active:styles.inactive}`}
        style={{width}}
    >
      {statusText}
    </div> , hoverText)
  
    return <>
          <Element />
      </>
  }