import React from 'react';

interface CartListsSvgProps {
    className?: string;
    width?: string | number;
    height?: string | number;
}

const CartListsSvg: React.FC<CartListsSvgProps> = ({
    className,
    width,
    height,
}) => {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            fill='none'
            viewBox="0 0 80 80" // Adjusted viewBox
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
        >
            <g filter="url(#filter0_d_68_328)">
                <g filter="url(#filter1_i_68_328)">
                    <path d="M50.3 43H50.1V44.85H50.3V43Z" fill="#F2F2F2" />
                </g>
                <path d="M50.2412 53.7104H26.5626V53.5401H50.0708V45.2781H28.5532L27.5079 43.1004L27.6615 43.0267L28.6604 45.1077H50.2412V53.7104Z" fill="#2F2E41" />
                <g filter="url(#filter3_i_68_328)">
                    <path d="M29.714 57.884C30.7019 57.884 31.5027 57.0832 31.5027 56.0953C31.5027 55.1075 30.7019 54.3066 29.714 54.3066C28.7261 54.3066 27.9253 55.1075 27.9253 56.0953C27.9253 57.0832 28.7261 57.884 29.714 57.884Z" fill="#3F3D56" />
                </g>
                <g filter="url(#filter4_i_68_328)">
                    <path d="M47.3452 57.884C48.3331 57.884 49.1339 57.0832 49.1339 56.0953C49.1339 55.1075 48.3331 54.3066 47.3452 54.3066C46.3574 54.3066 45.5565 55.1075 45.5565 56.0953C45.5565 57.0832 46.3574 57.884 47.3452 57.884Z" fill="#3F3D56" />
                </g>
                <g filter="url(#filter5_i_68_328)">
                    <path d="M68.1279 19.2145C68.7394 19.2145 69.2352 18.7188 69.2352 18.1073C69.2352 17.4957 68.7394 17 68.1279 17C67.5164 17 67.0206 17.4957 67.0206 18.1073C67.0206 18.7188 67.5164 19.2145 68.1279 19.2145Z" fill="#3F3D56" />
                </g>
                <g filter="url(#filter6_i_68_328)">
                    <path d="M52.6737 42.4236H26.0588L20.3 23.6H58.6044L58.5696 23.7108L52.6737 42.4236ZM26.1848 42.2533H52.5488L58.3722 23.7703H20.5302L26.1848 42.2533Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter7_i_68_328)">
                    <path d="M51.235 41.4943H27.8582L22.8 24.8H56.4441L56.4135 24.8983L51.235 41.4943Z" fill="#F2F2F2" />
                </g>
                <g filter="url(#filter8_i_68_328)">
                    <path d="M59.1817 21.962L59.017 21.9183L60.1411 17.6814H66.68V17.8518H60.2722L59.1817 21.962Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter9_i_68_328)">
                    <path d="M56.7903 29.3504H22.261V29.5207H56.7903V29.3504Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter10_i_68_328)">
                    <path d="M54.8129 35.6264H24.1811V35.7967H54.8129V35.6264Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter11_i_68_328)">
                    <path d="M39.6369 23.7289H39.4665V42.3822H39.6369V23.7289Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter12_i_68_328)">
                    <path d="M47.2637 23.7235L46.0409 42.3763L46.2109 42.3875L47.4338 23.7346L47.2637 23.7235Z" fill="#2F2E41" />
                </g>
                <g filter="url(#filter13_i_68_328)">
                    <path d="M31.8432 23.7233L31.6732 23.7344L32.8889 42.3877L33.0589 42.3766L31.8432 23.7233Z" fill="#2F2E41" />
                </g>
            </g>
            <defs>
                <filter id="filter0_d_68_328" x="-4" y="0" width="78" height="68" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_68_328" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_68_328" result="shape" />
                </filter>
                <filter id="filter1_i_68_328" x="50" y="42" width="4" height="2.45" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter3_i_68_328" x="27.8253" y="54.2066" width="3.77734" height="4.17734" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter4_i_68_328" x="45.4565" y="54.2066" width="3.77734" height="4.17734" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter5_i_68_328" x="66.9206" y="17" width="2.41455" height="2.81455" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter6_i_68_328" x="20.1648" y="23.5" width="38.5759" height="19.4236" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter7_i_68_328" x="22.6652" y="24.7" width="33.9148" height="17.2943" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter8_i_68_328" x="58.947" y="17.5814" width="7.853" height="4.90288" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter9_i_68_328" x="22.161" y="29.2504" width="34.7293" height="0.770361" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter10_i_68_328" x="24.0811" y="35.5264" width="30.8319" height="0.770361" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter11_i_68_328" x="39.3665" y="23.6289" width="0.370349" height="18.2533" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter12_i_68_328" x="46.0409" y="23.6171" width="1.6055" height="18.2767" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
                <filter id="filter13_i_68_328" x="31.6732" y="23.617" width="1.59833" height="18.277" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="0.4" />
                    <feGaussianBlur stdDeviation="0.2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_68_328" />
                </filter>
            </defs>
        </svg>
    );
};

export default CartListsSvg;
