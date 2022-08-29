const $ = (el, all = 'one') => all === 'one' ? document.querySelector(el) : [...document.querySelectorAll(el)]
const removeS = () => document.body.style.overflowY = 'hidden';
const addS = () => document.body.style.overflowY = 'unset';
const removeC = (el, name) => el.classList.remove(name);
const addC = (el, name) => el.classList.add(name);
const toggleC = (el, name) => el.classList.toggle(name);
const isC = (el, name) => el.classList.contains(name);
const _get = async (url) => await fetch(url).then(res => res.json());
const {gardens} = await _get('./js/garden.json');
const $_clsoeBtns = $('close_btn', 'all');

const closeModal = function() {
   addC(this.closest('.popup'), 'none');
   this.closest('form').reset();
   addS();
};


$_clsoeBtns.forEach(el => el.addEventListener("click", closeModal));

let page = $('section').id
{
    page === 'gardenAL' ? gardenALPage() : 
    page === 'gardenS' ? gardenSPage() : 
    '';
};

function gardenSPage(){
    
    const $gardenList = $('.gardenList');
    const $tagList = $('.tagList');
    const $input = $('#seach');
    let $_tags;
    function cho(str){
        const cho = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
        let result ='';
        for(let i = 0; i < str.length; i++){
            const code = parseInt((str.charCodeAt(i)-44032)/588);
            result += code < 0 ? str[i] : cho[code];

        }
        return result;
    } 
    
    
    function convert(name, sName){
        let choIndex = [...sName.matchAll(/[ㄱ-ㅎ]/g)].map(({index}) => index);
        let choname = cho(name);
        let sChoName = cho(sName);
        let splitCho  = [...choname.matchAll(sChoName)];
        
        
        if(splitCho.length === 0) return name;
        
        return splitCho.map(({index}, idx) => {
            let nextText = "";
            let prevText = "";
            let nCho = splitCho[idx+1];
            if(index !== 0 && idx === 0) prevText = name.slice(0, index);
            if(nCho){
                // index + 검색어 길이
                nextText = name.slice(index+sChoName.length, nCho.index);
            }else{
                // index + 검색어 길이
                nextText = name.slice(index+sChoName.length);
            }

            let hText = name.substr(index, sChoName.length)
            let cloneName = hText.split('');
            
            choIndex.map((index) => cloneName[index] = sName[index]);
            console.log(cloneName);
            
            cloneName = cloneName.join('');
            // 비교할 때 위에 들어온 검색어랑 같은가 체크
            // console.log(cloneName);
            if(cloneName == sName)return `${prevText}<span class="active">${hText}</span>${nextText}`
            else return `${prevText}${hText}${nextText}`
        }).join(''); 


    }


    const tagLode = (e) => {
        if(e.type === 'click') toggleC( e.currentTarget, 'active');
        $(`.tags>div`, 'all').forEach(ele => removeC( ele,'active'));
        $_tags.forEach(el => {
            if( !isC(el, 'active'))return;
            const name = el.dataset.tag;
            const elements = $(`.tags>div[data-tag="${name}"]`, 'all');
            elements.forEach(ele => {
                addC(ele, 'active')
                removeC(ele.closest('.item'),'none');
            });
        })
    }

    const gardenLode = (e) => {
        const sname = $input.value;
        $('.gardenList .item', 'all').forEach(el => {
            let title = el.querySelector('.title');
            let name = el.dataset.name
            let isName = convert(name,sname);
            title.innerHTML = name;
            if(!sname) return;
            if(isName == name) return;
                title.innerHTML = isName;
                removeC( el.closest('.item'), 'none');
        });
    };

    const reRode = (e) => {
        $('.gardenList .item', 'all').forEach(ele => addC(ele,'none'));
        tagLode(e);
        gardenLode(e);
    };

    const tagRender = () => {
        let tags = [...new Set((gardens.map(el => el.themes.map(tag => tag).join(','))).join(',').split(','))];
        $tagList.innerHTML = tags.map(tag => `<button data-tag="${tag}" class="">${tag}</button>`).join('');
        $_tags = $('.tagList button', 'all');
        $_tags.forEach(el => el.addEventListener("click", reRode));
    };

    const gardenRender = () => {
        $gardenList.innerHTML = gardens.map(e => `
        <div class="item" data-name="${e.name}">
        <div class="img_box" ><img src="./data/img/민간정원/${e.name}1.jpg" alt="garden" title="garden"></div>
        <div class="text_wrap">
            <p class="title">${e.name}</p>
            <div class="tags flex">${e.themes.map(el => `<div data-tag="${el}" class="">${el}</div>`).join('')}</div>
            
        </div>
        </div>    
    `).join('');
    }

    $input.addEventListener("input", reRode);
    (function init(){
        gardenRender();
        tagRender();
    })();
}


function gardenALPage(){
    const $select = $('#garden');
    const $gardenWrap = $('.info_wrap');
    const $view_wrap = $('#viewer_wrap');
    const $view_box = $('.view_box');
    const $view = $('.view');
    const $_viewImgs = $('.view .img_box', 'all');

    let mouseD = {sx:0, sy:0, gx:0 , gy:0, ex:0, ey:0};
    let mouseChkC = false;
    let mouseChkM = false
    const openPano = () => {
        
        removeC($view_wrap, 'none');
        removeS();
    }

    const selectRender = () => {
        gardens.forEach(el => {
            const option = document.createElement('option');
            Object.assign(option, {
                value: el.name,
                innerText: el.name,
            });
            $select.appendChild(option);
       });
    }
    const pingRender = () => {
       const name =  $select.value;
       const $ping = $('.map .ping');
       const sx  =[127.5718, 129.2097];
       const sy = [34.7100, 35.9255];
       gardens.map(el => {
            if(el.name == name){
                const x = ((sx[1] - el.longitude)/ (sx[1] - sx[0])) *100
                const y = ((sy[1] - el.latitude)/ (sy[1] - sy[0])) *100
                Object.assign($ping.style, {
                    right : `${x}%`,
                    top : `${y}%`
                })
            }
       });
    };
    
    const onChangeGarden = () => {
        let name = $select.value;
        $gardenWrap.innerHTML = gardens.map(el => el.name === name ?
             `<div class="text_wrap">
            <div class="title">
            <p>GARDEN</p>
            <h2>${el.name}</h2>
            </div>
            <div class="text flex">
                <p>주소:${el.address}</p>
                <p>연락처:${el.phone}</p>
                <p>관리 기관:${el.management}</p>
                <p>별점:${el.score}점</p>
            </div>
            <p class="content">${el.introduce}</p>
            <button class="back">리뷰 바로가기</button>
            <button class="back">예약 바로가기</button>
            <button class="back pano">파노라마</button>
        </div>
        <div class="img_box">
            <img src="./data/img/민간정원/${el.name}2.jpg" alt="garden" title="garden" />
        </div>` : '').join('');
        $('.pano').addEventListener("click", openPano);
        pingRender();
    };


    const viewEvt = (e) =>  {
        switch (e.type) {
            case "mousedown" : 
                mouseChkC = true;
                mouseD.sx = e.layerX;
                mouseD.sy = e.layerY;
                mouseChkM = true;
                break;
            case "mousemove" : 
                if(mouseChkC){   
                    mouseChkM = false;
                    let x = (e.layerX - mouseD.sx)/6;
                    let y = (e.layerY - mouseD.sy)/6;
                    mouseD.gx = mouseD.ex + y > 90 ? 90 : mouseD.ex + y < -90  ? -90 : mouseD.ex + y;
                    mouseD.gy = mouseD.ey - x;
                    
                    $view.style.transform = `translateZ(200px) rotateX(${mouseD.gx}deg) rotateY(${mouseD.gy}deg)`;
                }
                break;
            case "mouseup" : 
                 mouseChkC = false;
                 mouseD.ex = mouseD.gx;
                 mouseD.ey = mouseD.gy;
                break;
            case "click" : 
                if(mouseChkM){
                    const deg = e.currentTarget.dataset.deg;
                    $('.view .img_box img', 'all').forEach(el => el.style.opacity = 0);
                    setTimeout(() => {
                        $('.view .img_box img', 'all').forEach(el => el.style.opacity = 1);
                        $view.style.transform = `translateZ(200px) rotateX(0deg) rotateY(${deg}deg)`;
                    }, 500);
                }
                break;
            case "keydown" : 
                if(e.key === 'ArrowUp'){
                    mouseD.ex = mouseD.ex+ 1 > 90 ? 90 : mouseD.ex + 1 < -90  ? -90 : mouseD.ex + 1;
                    $view.style.transform = `translateZ(200px) rotateX(${mouseD.ex}deg) rotateY(${mouseD.ey}deg)`;
                }else if(e.key === 'ArrowDown'){
                    mouseD.ex = mouseD.ex - 1 > 90 ? 90 : mouseD.ex - 1 < -90  ? -90 : mouseD.ex - 1;
                    $view.style.transform = `translateZ(200px) rotateX(${mouseD.ex}deg) rotateY(${mouseD.ey}deg)`;
                }else if(e.key === 'ArrowLeft'){
                    mouseD.ey = mouseD.ey- 1;
                    $view.style.transform = `translateZ(200px) rotateX(${mouseD.ex}deg) rotateY(${mouseD.ey}deg)`;
                    
                }else if(e.key === 'ArrowRight'){
                    mouseD.ey = mouseD.ey+ 1;
                    $view.style.transform = `translateZ(200px) rotateX(${mouseD.ex}deg) rotateY(${mouseD.ey}deg)`;
                }
                break;
        };
     }
    const onViewEvt = (e) => {
        viewEvt(e);
    }

    $_viewImgs.forEach(el => el.addEventListener("click", onViewEvt))
    $select.addEventListener("change", onChangeGarden);
    $view_box.addEventListener("mousedown", onViewEvt);
    $view_box.addEventListener("mousemove", onViewEvt);
    window.addEventListener("mouseup", onViewEvt);
    window.addEventListener("keydown", onViewEvt);
    
    (function init(){
        selectRender();
        onChangeGarden();
    })();

    
}