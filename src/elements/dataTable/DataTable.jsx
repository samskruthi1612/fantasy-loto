import { Grid } from '@mui/material';
import './DataTable.css'

export const DataTable = ({columnConfig, rowContent, spacing, totalColumns}) => {
    return (
        <div className="dataTable">
            <div className="dataRow dataTitleRow">
                <Grid container spacing={spacing} columns={totalColumns}>
                    {
                        columnConfig.map((dataColumn) => 
                            <Grid item lg={dataColumn.gridColumns} >
                                {dataColumn.name}
                            </Grid>
                        )
                    }
                </Grid>
            </div>
            {rowContent.map((rowItem, key, list) => (
                <div className={`dataRow ${key==(list.length-1)?'dataLastRow':''}`} key={key}>
                    <Grid container spacing={spacing} columns={totalColumns} alignItems="center" zeroMinWidth>
                        {
                            rowItem.map((cellData, idx)=>{
                                const conf = columnConfig[idx]
                                const Element = cellData.Element
                                const props = cellData.props
                                return <Grid item lg={conf.gridColumns} zeroMinWidth>
                                    {!conf.isReactElement?cellData.text:<Element {...props} />}
                                </Grid>
                            }
                            )
                        }
                    </Grid>
                </div>
            ))}
        </div>
    )
}