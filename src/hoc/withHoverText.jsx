import styles from './withHoverText.module.css'

export const withHoverText = (jsx, hoverText) => {
    return () => (
        <div className={styles.componentCommentsParent}>
            <div className={styles.component}>
                {jsx}
            </div>
            {hoverText && <div className={styles.comments}>
                    {hoverText??''}
                </div>
            }
        </div>
    )
}