import React, { useState, useEffect } from 'react'
import Lightbox from 'react-image-lightbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedo } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

const HoverIcon = styled(FontAwesomeIcon)`
	color: #bfbbbb;
	:hover {
		color: #fff;
	}
`

export default ({ image }) => {
    const [is_open, setIsOpen] = useState(false)
    const [imageRotate, setImageRotate] = useState([])
    useEffect(() => {
        setImageRotate({
            ...image,
            angle: image?.angle || 0
        })
        return () => {
        }
    }, [image])
    const rotateImage =()=>{
        let angle = (imageRotate.angle + 90) % 360;
        setImageRotate({
            ...imageRotate,
            angle
        })
        const transform = document.getElementsByClassName('ril-image-current')[0].style.transform
        if(transform.indexOf('rotate')>-1){
            document.getElementsByClassName('ril-image-current')[0].style.transform = transform.replace(`rotate(${imageRotate.angle}deg)`, `rotate(${angle}deg)`)
        }else{
            document.getElementsByClassName('ril-image-current')[0].style.transform = `${transform} rotate(${angle}deg)`;
        }
    }
    const BillAction  =  [
        <HoverIcon className="cursor-pointer mr-2" onClick={()=> rotateImage()} icon={faRedo}/>
    ];
    return (
        <span>
            <img onClick={()=> setIsOpen(true)} loading="lazy" src={imageRotate.src} className="w-100 cursor-pointer" style={{height: 70, objectFit: 'contain'}}/>
         
            {is_open && <Lightbox
                toolbarButtons={BillAction}
                clickOutsideToClose={false}
                mainSrc={imageRotate.src}

                imageTitle={imageRotate.title}
                imageCaption={imageRotate.caption}
                onCloseRequest={() => setIsOpen(false)}
            />}
        </span>
    )
}
