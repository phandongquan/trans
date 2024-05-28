import React, { useState, Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointRight } from '@fortawesome/free-regular-svg-icons'
import { PrintSPAInfo } from './components/PrintSPAInfo'
import { Modal } from 'antd';
import { faDesktop, faEye } from '@fortawesome/free-solid-svg-icons';

const PreviewWindow = ({ template, element }) => {
    const [visible, setVisible] = useState(false)
    return (
        <Fragment>
            <span onClick={()=>setVisible(true)}>
                {element}
            </span>
            <Modal
               width={800}
               onCancel={()=>setVisible(false)}
               open={visible}
               destroyOnClose
               footer={null}
               zIndex={9999}
            >
                <div style={{maxWidth: 700, margin: '0 auto'}}>
                    <div>
                        <div className="pt-5">{templates[template]}</div>
                    </div>
                </div>
            </Modal>
        </Fragment>
    )
}

const Footer =()=>{
    return (
        <div className="text-center">
            <div>Hasaki Clinic & Spa xin cảm ơn quý khách</div>
            <PrintSPAInfo/>
        </div>
    )
}
const Template1 = () => {
    return (
        <div>
            <h5 style={{maxWidth: 500}} className="text-center mx-auto mb-4">LỜI DẶN CỦA BÁC SĨ SAU KHI LẤY MỤN</h5>
            <div className="p-4 border border-dark border-2 mb-2">
                <ol>
                    <li>
                        <b>NHỮNG ĐIỂM LƯU Ý</b>
                        <ul className="mb-2">
                            <li>Sau khi làm xong da sẽ hơi đỏ, sau 3 tiếng rửa lại với nước hoặc nước muối sinh lý.</li>
                            <li>Nếu dùng kem chống nắng thì tẩy trang, dùng sữa rửa mặt như bình thường nhưng chỉ dùng các sản phẩm dịu nhẹ, thích hợp cho da mụn nhạy cảm.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHĂM SÓC DA TẠI NHÀ</b>
                        <div className="row">
                            <div className="col-6 pr-4 border-right border-dark">
                                <div className="text-center font-weight-bold">NÊN</div>
                                <ul className="p-0">
                                    <li>Sau lấy mụn, có thể thoa những sản phẩm kháng viêm (theo hướng dẫn của Bác sĩ) để hạn chế tình trạng nhiễm khuẩn.</li>
                                    <li>Nên dùng kem dưỡng có chức năng kháng viêm, kiềm nhờn theo chỉ định của Bác sĩ.</li>
                                    <li>Bôi kem chống nắng (dành cho da mụn) 2- 3 lần/1 ngày, che chắn thật kĩ, tránh để da tiếp xúc với ánh nắng mặt trời.</li>
                                </ul>   
                            </div>
                            <div className="col-6">
                                <div className="text-center font-weight-bold">KHÔNG NÊN</div>
                                <ul>
                                    <li>Sau lấy mụn, tuyệt đối không nên sờ tay vào nốt mụn vì có thể gây sưng tấy và viêm nhiễm.</li>
                                    <li>Tránh massage mặt trong quá trình điều trị mụn.</li>
                                    <li>Không nên bôi kem dưỡng trực tiếp lên các vết mụn. Khi vết mụn đã khép miệng (tầm 1 - 2 ngày) bạn có thể bôi như bình thường.</li>
                                </ul>  
                            </div>
                        </div>
                    </li>
                    <li>
                        <b>CHẾ ĐỘ ĂN UỐNG</b>
                        <ul className="mb-2">
                            <li>Không nên ăn thức ăn cay, nóng, đồ ngọt, đồ béo. Tránh bia rượu, cà phê.</li>
                            <li>Chú ý bổ sung thêm cam, chanh, táo cùng nước trà xanh để da được khỏe, nhanh lành.</li>
                        </ul>
                    </li>
                </ol>
                <div>
                    <b><FontAwesomeIcon icon={faHandPointRight}/> Tuân thủ các yêu cầu của bác sĩ và tái khám đúng lịch hẹn.</b>
                </div>
            </div>
            <Footer/>
        </div>
    )
}

const Template2 = () => {
    return (
        <div>
            <h5 style={{maxWidth: 500}} className="text-center mx-auto mb-4">LỜI DẶN CỦA BÁC SĨ CHĂM SÓC DA SAU KHI TẨY NỐT RUỒI, MỤN THỊT, MỤN CÓC</h5>
            <div className="p-4 border border-dark border-2 mb-2">
                <ol>
                    <li>
                        <b>NHỮNG ĐIỂM LƯU Ý</b>
                        <ul className="mb-2">
                            <li>Trong 3-5 ngày đầu nên sử dụng nước muối sinh lý để làm sạch da một cách nhẹ nhàng.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHĂM SÓC DA TẠI NHÀ</b>
                        <ul className="mb-2">
                            <li>Sử dụng kem/ thuốc kháng khuẩn: do vùng da mới đố còn mỏng và yếu, rất dễ bị nhiễm khuẩn và dễ để lại các vấn đề xấu cho da.</li>
                            <li>Thoa thuốc/ kem thúc đẩy tái tạo da: do sau khi đốt một số tế bào da bị thiếu hụt nên tại vị trí đốt dễ gây ra sẹo lõm. Vì vậy, nên sử dụng một số sản phẩm tái tạo da chứa vitamin E, C, Hyaluronic acid...giúp đẩy nhanh sự tăng sinh collagen và elastin dưới da.</li>
                            <li>Thoa kem chống nắng: do vùng da sau đốt rất yếu và dễ bị thương tổn, tia UV trong ánh nắng mặt trời có thể xuyên qua và phá vỡ liên kết dưới da cũng như tăng thêm sắc tố melanin gây hiện tượng thâm tại chỗ đốt.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHẾ ĐỘ ĂN UỐNG</b>
                        <div className="row">
                            <div className="col-6 pr-4 border-right border-dark">
                                <div className="text-center font-weight-bold">Một số thực phẩm nên ăn</div>
                                <ul className="p-0">
                                    <li>Nhóm giàu vitamin A; bí đỏ, cà chua, cà rốt...</li>
                                    <li>Thực phẩm giàu vitamin C; cam, bưởi, kiwi, dâu...</li>
                                    <li>Nhóm giàu vitamin E: các loại hạt: hạnh nhân, hướng dương...</li>
                                    <li>Uống nhiều nước.</li>
                                </ul>   
                            </div>
                            <div className="col-6">
                                <div className="text-center font-weight-bold">Một số thực phẩm nên tránh</div>
                                <ul>
                                    <li>Rau muống: Rau muống kích thích tăng sinh collagen vượt mức dễ gây ra sẹo lồi.</li>
                                    <li>Thịt gà: thịt gà dễ khiến vùng da non bị ngứa và hồi phục chậm hơn bình thường.</li>
                                    <li>Thịt bò: thịt bò giàu chất đạm , sẽ thúc đẩy sự phát triển của tế bào da và hình thành sẹo lồi không mong muốn.</li>
                                    <li>Hải sản: vùng da sau đốt, trong quá trình tái tạo thì hải sản dễ gây ngứa ngáy khó chịu.</li>
                                    <li>Đồ nếp: dễ làm cho vùng da sau đốt dễ viêm nhiễm, mưng mũ.</li>
                                </ul>  
                            </div>
                        </div>
                    </li>
                </ol>
                <div>
                    <b><FontAwesomeIcon icon={faHandPointRight}/> Tuân thủ các yêu cầu của bác sĩ và tái khám đúng lịch hẹn.</b>
                </div>
            </div>
            <Footer/>
        </div>
    )
}


const Template3 = () => {
    return (
        <div>
            <h5 style={{maxWidth: 500}} className="text-center mx-auto mb-4">LỜI DẶN CỦA BÁC SĨ CHĂM SÓC DA<br/>SAU DỊCH VỤ LASER FRACTIONAL CO2</h5>
            <div className="p-4 border border-dark border-2 mb-2">
                <ol>
                    <li>
                        <b>NHỮNG ĐIỂM LƯU Ý</b>
                        <ul className="mb-2">
                            <li>Da sẽ hơi đỏ ngay sau khi kết thúc điều trị.</li>
                            <li>Về nhà, khách hàng có thể rửa mặt bằng nước lạnh sạch hoặc nước muối sinh lý 0.9%.</li>
                            <li>Qua những ngày sau da sẽ bắt đầu tạo mài và hơi sạm màu hoặc sần sùi: là dấu hiệu bình thường của quá trình tái tạo mô.</li>
                            <li>Tuyệt đối không được cạy mà để mài bong tự nhiên.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHĂM SÓC DA TẠI NHÀ</b>
                        <div className="row">
                            <div className="col-6 pr-4 border-right border-dark">
                                <div className="text-center font-weight-bold">NÊN</div>
                                <ul className="p-0">
                                    <li>Ngày 1: Sau 1 - 2h có thể có cảm giác nóng rát, khách hàng có thể chườm lạnh.</li>
                                    <li>Những ngày đầu nên tránh nắng tuyệt đối. Nếu được hãy ở trong nhà, không ra ngoài vào ban ngày.</li>
                                    <li>Trong 2 - 3 ngày đầu chỉ rửa mặt bằng nước muối sinh lý/nước lạnh sạch. Tay phải được rửa sạch trước khi tiếp xúc với da, rửa mặt thật nhẹ nhàng.</li>
                                    <li>Ngày 2, 3: Thoa huyết thanh hoặc serum tế bào gốc và kem dưỡng ẩm phục hồi da theo chỉ định của Bác sĩ, xịt khoáng mỗi khi da khô.</li>
                                    <li>Nếu bắt buộc phải tiếp xúc trực tiếp với ánh nắng thì bôi kem chống nắng cho da nhạy cảm, che chắn cẩn thận (đội nón mũ, khẩu trang, tránh tiếp xúc nắng trực tiếp) và rửa mặt với nước sau khi về đến nhà.</li>
                                    <li>Từ ngày 4 -7: Da bắt đầu bong. Có thể sử dụng sửa rửa mặt dịu nhẹ không hạt, tẩy trang dịu nhẹ, thoa dưỡng ẩm phục hồi da và kem chống nắng.</li>
                                    <li>Sau khi mài trên da đã bong hết thì bôi kem chống nắng 3 lần/1 ngày (SPF 50+ trở lên) ngay cả khi ở trong nhà.</li>
                                </ul>   
                            </div>
                            <div className="col-6">
                                <div className="text-center font-weight-bold">KHÔNG NÊN</div>
                                <ul>
                                    <li>Vì da khá nhạy cảm trong những ngày đầu nên không makeup, skincare.</li>
                                    <li>Không xông hơi trong ít nhất 2 tuần đầu.</li>
                                </ul>  
                            </div>
                        </div>
                    </li>
                    <li>
                        <b>CHẾ ĐỘ ĂN UỐNG</b>
                        <ul className="mb-2">
                            <li>Bổ sung viên uống trắng da, viên uống tránh nắng mỗi ngày kết hợp kem chống nắng chuyên biệt sau các liệu trình Laser theo tư vấn của Bác sĩ da liễu.</li>
                            <li>Bổ sung thêm đạm từ thịt, cá, lươn, trứng, giò heo, da heo,... để da mau lành.</li>
                            <li>Tăng cường các loại trái cây chứa nhiều vitamin C như táo, cam, chanh,...</li>
                            <li>Từ tuần 1 - 3 tránh ăn đồ cay nóng, rượu bia, cà phê, sản phẩm có cồn, không tập thể dục mạnh.</li>
                            <li>Uống đủ 2 - 3 lít nước mỗi ngày.</li>
                        </ul>
                    </li>
                </ol>
                <div>
                    <b><FontAwesomeIcon icon={faHandPointRight}/> Tuân thủ các yêu cầu của bác sĩ và tái khám đúng lịch hẹn.</b>
                </div>
            </div>
            <Footer/>
        </div>
    )
}


const Template4 = () => {
    return (
        <div>
            <h5 style={{maxWidth: 500}} className="text-center mx-auto mb-4">LỜI DẶN CỦA BÁC SĨ CHĂM SÓC DA<br/>SAU KHI LÀM PEEL</h5>
            <div className="p-4 border border-dark border-2 mb-2">
                <ol>
                    <li>
                        <b>NHỮNG ĐIỂM LƯU Ý</b>
                        <ul className="mb-2">
                            <li>Sau khi làm xong thì da sẽ hơi căng và đỏ, sau 3 tiếng rửa mặt lại với nước. Nếu có chống nắng thì tẩy trang, dùng sữa rửa mặt bình thường.</li>
                            <li>Liệu trình peel có thể kéo dài từ 3 - 5 lần. Mỗi lần cách nhau từ 1 đến 2 tuần tùy tình trạng da.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHĂM SÓC DA TẠI NHÀ</b>
                        <div className="row">
                            <div className="col-6 pr-4 border-right border-dark">
                                <div className="text-center font-weight-bold">NÊN</div>
                                <ul className="p-0">
                                    <li>Trong 3 ngày đầu, da có hiện tượng khô chỉ sử dụng sản phẩm dưỡng ẩm phục hồi da.</li>
                                    <li>Từ 3-7 ngày sẽ có hiện tượng bong da: nên thoa các sản phẩm dưỡng ẩm phục hồi , các sản phẩm tái tạo da, điều hoà tăng sinh tế bào...và sử dụng kem chống nắng phổ rộng từ SPF 30 đến SPF 50. Dưỡng ẩm bôi càng nhiều càng tốt giúp kích thích bong, ngày 2-4 lần.</li>
                                    <li>Dùng sản phẩm trị mụn, trị nám sau khi da bong xong.</li>
                                    <li>Dùng kem dưỡng phục hồi da, chống tăng sắc tố, nuôi da ngay sau peel.</li>
                                </ul>   
                            </div>
                            <div className="col-6">
                                <div className="text-center font-weight-bold">KHÔNG NÊN</div>
                                <ul>
                                    <li>Không nên dùng các sản phẩm gây bong tróc, chế phẩm chứa AHA, BHA, không dùng các sản phẩm ở dạng cát.</li>
                                    <li>Da sẽ có hiện tượng bong tróc từ ngày thứ 3. Hiện tượng này sẽ kéo dài từ 1-4 ngày tùy tình trạng da. Không tự cạy, để da bong tự nhiên. Sau khi bong da hết, dưỡng da như ban đầu.</li>
                                </ul>  
                            </div>
                        </div>
                    </li>
                    <li>
                        <b>CHẾ ĐỘ ĂN UỐNG</b>
                        <ul className="mb-2">
                            <li>Kết hợp viên uống trắng da và viên uống chống nắng mỗi ngày.</li>
                        </ul>
                    </li>
                </ol>
                <div>
                    <b><FontAwesomeIcon icon={faHandPointRight}/> Tuân thủ các yêu cầu của bác sĩ và tái khám đúng lịch hẹn.</b>
                </div>
            </div>
            <Footer/>
        </div>
    )
}


const Template5 = () => {
    return (
        <div>
            <h5 style={{maxWidth: 500}} className="text-center mx-auto mb-4">LỜI DẶN CỦA BÁC SĨ<br/>SAU ĐIỀU TRỊ SẸO RỖ 5 IN 1</h5>
            <div className="p-4 border border-dark border-2 mb-2">
                <ol>
                    <li>
                        <b>NHỮNG ĐIỂM LƯU Ý</b>
                        <ul className="mb-2">
                            <li>Sau khi làm xong da sẽ hơi căng rát và đỏ. Trong vòng 24h tiếng chỉ nên xịt khoáng và rửa mặt bằng nước muối sinh lý.</li>
                            <li>Qua những ngày sau da sẽ bắt đầu tạo mài và hơi sạm, những chỗ được cắt đáy sẹo sẽ hơi bầm. Khoảng 7 ngày lớp mài sẽ bong ra. Tuyệt đối không được cạy mà để mài bong tự nhiên.</li>
                        </ul>
                    </li>
                    <li>
                        <b>CHĂM SÓC DA TẠI NHÀ</b>
                        <div className="row">
                            <div className="col-6 pr-4 border-right border-dark">
                                <div className="text-center font-weight-bold">NÊN</div>
                                <ul className="p-0">
                                    <li>3 ngày đầu tiên chỉ rửa mặt bằng nước muối sinh lý/nước đun sôi để nguội. Tay phải được rửa sạch trước khi tiếp xúc với da, rửa thật nhẹ nhàng, lau khô bằng gạc y tế để đảm bảo vô khuẩn.</li>
                                    <li>3 ngày đầu nên tránh nắng tuyệt đối. Nếu được hãy ở trong nhà, không ra ngoài vào ban ngày.</li>
                                    <li>Thoa huyết thanh từ máu tự thân 2 lần/ngày, sáng và tối.</li>
                                    <li>Nếu bắt buộc phải tiếp xúc trực tiếp với ánh nắng thì hãy bôi kem chống nắng cho da nhạy cảm và rửa mặt lại với nước sau khi về đến nhà.</li>
                                    <li>Xịt khoáng mỗi khi da khô, bôi kem dưỡng ẩm bác sĩ chỉ định 2 - 3 lần/ngày.</li>
                                    <li>Sau 3 ngày, sử dụng sửa rửa mặt dịu nhẹ, sản phẩm dưỡng ẩm phục hồi, kích thích tái tạo da...sử dụng kem chống nắng phổ rộng, từ SPF 30 đến SPF 50.</li>
                                </ul>   
                            </div>
                            <div className="col-6">
                                <div className="text-center font-weight-bold">KHÔNG NÊN</div>
                                <ul>
                                    <li>Vì da khá nhạy cảm trong 3 ngày đầu, nên không makeup, skincare.</li>
                                </ul>  
                            </div>
                        </div>
                    </li>
                    <li>
                        <b>CHẾ ĐỘ ĂN UỐNG</b>
                        <ul className="mb-2">
                            <li>Bổ sung viên uống trắng da, viên uống tránh nắng mỗi ngày.</li>
                            <li>Bổ sung thêm đạm từ thịt, cá, lươn, trứng, giò heo, da heo,... để da mau lành.</li>
                            <li>Tăng cường các loại trái cây chứa nhiều vitamin C như táo, cam, chanh,...</li>
                            <li>Tránh ăn đồ cay nóng, rượu bia, cà phê.</li>
                            <li>Uống đủ 2 - 3 lít nước mỗi ngày.</li>
                        </ul>
                    </li>
                </ol>
                <div>
                    <b><FontAwesomeIcon icon={faHandPointRight}/> Tuân thủ các yêu cầu của bác sĩ và tái khám đúng lịch hẹn.</b>
                </div>
            </div>
            <Footer/>
        </div>
    )
}
export const templates = {
    'tpl_1': <Template1/>,
    'tpl_2': <Template2/>,
    'tpl_3': <Template3/>,
    'tpl_4': <Template4/>,
    'tpl_5': <Template5/>
}
const options = [
    {label: 'LỜI DẶN SAU KHI LẤY MỤN', value: 'tpl_1'},
    {label: 'LỜI DẶN SAU KHI TẨY NỐT RUỒI, MỤN THỊT, MỤN CÓC', value: 'tpl_2'},
    {label: 'LỜI DẶN SAU DỊCH VỤ LASER FRACTIONAL CO2', value: 'tpl_3'},
    {label: 'LỜI DẶN SAU KHI LÀM PEEL', value: 'tpl_4'},
    {label: 'LỜI DẶN SAU ĐIỀU TRỊ SẸO RỖ 5 IN 1', value: 'tpl_5'}
]
export default options

export const option_print = options.map(option=> ({
    ...option,
    label: <span>{option.label} <PreviewWindow template={option.value} element={<button type="button" className="btn btn-sm btn-outline-primary float-right mt-1"><FontAwesomeIcon icon={faDesktop}/></button>}/></span>
}))