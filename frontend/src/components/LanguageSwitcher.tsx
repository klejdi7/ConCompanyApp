'use client';

import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
const { i18n } = useTranslation();

const languages = [
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
	{ code: 'sq', name: 'Shqip', flag: '🇦🇱' }
];

const handleLanguageChange = (lng: string) => {
	i18n.changeLanguage(lng);
};

return (
	<div className="dropdown">
		<button 
			className="btn btn-outline-secondary dropdown-toggle" 
			type="button" 
			data-bs-toggle="dropdown"
		>
			{languages.find(lang => lang.code === i18n.language)?.flag} 
			{languages.find(lang => lang.code === i18n.language)?.name}
		</button>
		<ul className="dropdown-menu">
			{languages.map((language) => (
			<li key={language.code}>
				<button 
					className="dropdown-item" 
					onClick={() => handleLanguageChange(language.code)}
				>
				<span className="me-2">{language.flag}</span>
					{language.name}
				</button>
			</li>
			))}
		</ul>
	</div>
);
}