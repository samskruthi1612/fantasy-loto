import img from '../../resources/loader.gif'

export const FantasyLotoLoader = () => {
    return <><img src={img} style={{height: '200px', width: '200px', zIndex: '3'}} /></>
}

export const CenterFantasyLoader = () => {
    return <div style={{'position':'fixed', top:'45%', 'left':'50%', height: '150px', width: '150px', zIndex: '3'}}><FantasyLotoLoader /></div>
}