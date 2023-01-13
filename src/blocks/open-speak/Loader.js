import OH_LOGO from './assets/OH_LOGO.svg';

const Loader = () => {
    return (
        <div id='overlay'>
            <div className='loading'>
                <svg
                    className='circle__svg'
                    viewBox='0 0 110 110'
                    width='200'
                    height='220'
                >
                    <image
                        className='logo-svg'
                        href={OH_LOGO}
                        height='25'
                        width='25'
                        x='42'
                        y='40'
                    />
                    <circle className='outer-circle' cx='55' cy='55' r='45' />
                    <circle
                        className='circle__svg-circle circle'
                        cx='55'
                        cy='55'
                        r='45'
                    />
                </svg>
            </div>
        </div>
    );
};

export default Loader;
