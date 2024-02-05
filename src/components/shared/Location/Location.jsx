import {ReactComponent as LocationIcon} from '../../../resources/location_on.svg'

export const Location = ({coordinates, locationDetails}) => {

    return (<a href={'https://www.google.com/maps/search/?api=1&query='+coordinates.replaceAll(' ','')} 
                style={{textDecoration:'none', color: '#000000', display:'flex', 'flexDirection':'row'}}
                target="_blank" rel="noreferrer"
            >
        {locationDetails===''?coordinates: locationDetails}
        <LocationIcon />
    </a>)
}