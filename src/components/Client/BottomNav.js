import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faExchangeAlt, faChartBar, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';

const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-500 py-2 border-t-2 border-blue-700">
            <div className="flex justify-around items-center">
                <NavItem icon={faHome} label="Home" link="/client/dashboard" />
                <NavItem icon={faSearch} label="Search" link="/search" />
                <NavItem icon={faExchangeAlt} label="Trade" link="/selectTrade" />
                <NavItem icon={faChartBar} label="Chart" link="/chart" />
                <NavItem icon={faBriefcase} label="portfolio" link="/portfolio" />
            </div>
        </div>
    );
};

const NavItem = ({ icon, label, link }) => {
    const { pathname } = useLocation();

    return (
        <Link
            to={link}
            className={`flex flex-col items-center justify-center text-center mx-auto px-4 w-full ${
                pathname === link
                    ? 'text-white'
                    : 'text-blue-200 hover:text-white'
            }`}
        >
            <FontAwesomeIcon icon={icon} className="text-xl mb-1" />
            <span className="block text-xs">{label}</span>
            <div
                className={`h-1 w-full mt-1 ${
                    pathname === link
                        ? 'bg-white'
                        : 'bg-transparent group-hover:bg-white'
                }`}
            />
        </Link>
    );
};

export default BottomNav;
