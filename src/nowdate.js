//현재 날짜를 리턴하는 함수
//나중에 루틴 생성할때도 현재 날짜정보가 필요할것같아서 만들었습니당

const nowDate = () => {
    let today = new Date();   
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜

    return year + '-' + month + '-' + date; 
}

export default nowDate;