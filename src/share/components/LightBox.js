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

export default ({ images }) => {
    const [is_open, setIsOpen] = useState(false)
    const [photo_index, setPhotoIndex] = useState(0)
    const [imagesRotate, setImagesRotate] = useState([])
    useEffect(() => {
        setImagesRotate(images.map(item=>{
            const image = imagesRotate.find(img=> img.id == item.id)
            return {
                ...item,
                angle: image?.angle || 0
            }
        }))
        return () => {
        }
    }, [images])
    const rotateImage =()=>{
        let angle = (imagesRotate[photo_index].angle + 90) % 360;
        setImagesRotate(imagesRotate.map((item, i)=>{
            if(i == photo_index){
                return {
                    ...item,
                    angle
                }
            }
            return item
        }))
        const transform = document.getElementsByClassName('ril-image-current')[0].style.transform
        if(transform.indexOf('rotate')>-1){
            document.getElementsByClassName('ril-image-current')[0].style.transform = transform.replace(`rotate(${imagesRotate[photo_index].angle}deg)`, `rotate(${angle}deg)`)
        }else{
            document.getElementsByClassName('ril-image-current')[0].style.transform = `${transform} rotate(${angle}deg)`;
        }
    }
    const handleSetPhotoIndex =(index)=>{
        setPhotoIndex(index)
        setTimeout(() => {
            const transform = document.getElementsByClassName('ril-image-current')[0].style.transform
            document.getElementsByClassName('ril-image-current')[0].style.transform = `${transform} rotate(${imagesRotate[index].angle || 0}deg)`;
        }, 0);
    }
    const BillAction  =  [
        <HoverIcon className="cursor-pointer mr-2" onClick={()=> rotateImage()} icon={faRedo}/>
    ];
    return (
        <div>
            <div className="row no-gutters">
                {imagesRotate.map((item, index)=><div key={index} className="col-2 m-1">
                    <div className="bg-white p-1 rounded border cursor-pointer" onClick={()=> {setIsOpen(true); setPhotoIndex(index)}}>
                        <img loading="lazy" src={item.src} className="w-100" style={{height: 100, objectFit: 'contain'}}/>
                        <div className="text-center">{item.caption}</div>
                    </div>
                </div>)}
            </div>
            {is_open && <Lightbox
                toolbarButtons={BillAction}
                clickOutsideToClose={false}
                mainSrc={imagesRotate[photo_index].src}
                nextSrc={photo_index == imagesRotate.length - 1 ? null : imagesRotate[(photo_index + 1) % imagesRotate.length].src}
                prevSrc={photo_index == 0 ? null : imagesRotate[(photo_index + imagesRotate.length - 1) % imagesRotate.length].src}

                imageTitle={imagesRotate[photo_index].title}
                imageCaption={imagesRotate[photo_index].caption}
                onCloseRequest={() => setIsOpen(false)}
                onMovePrevRequest={() =>
                    handleSetPhotoIndex((photo_index + imagesRotate.length - 1) % imagesRotate.length)
                }
                onMoveNextRequest={() =>
                    handleSetPhotoIndex((photo_index + 1) % imagesRotate.length)
                }
            />}
        </div>
    )
}
