export type Track = 'design' | 'fullstack' | 'ai';

export type Shot = {
	src: string;
	alt: string;
	focus?: 'top' | 'center';
};

export type Project = {
	slug: string;
	title: string;
	eyebrow: string;
	summary: string;
	role: string;
	when: string;
	context: string;
	featured: boolean;
	tracks: Track[];
	stack: string[];
	did: string[];
	note?: string;
	href?: string;
	hrefLabel?: string;
	image: Shot;
	gallery: Shot[];
};

export const person = {
	name: 'Peter Huba',
	email: 'hire@huba.sk',
	phone: '+420 775 275 004',
	phoneHref: 'tel:+420775275004',
	linkedin: 'https://www.linkedin.com/in/hubargb',
	linkedinLabel: 'linkedin.com/in/hubargb',
	place: 'Třebíč, Czechia',
	portrait: '/img/portrait.jpg'
};

export const site = {
	origin: 'https://huba.sk',
	title: 'Peter Huba — design, full-stack, AI-assisted',
	description:
		'Peter Huba is a design-trained full-stack developer in Třebíč. Twenty-five years of interfaces, product UI, and systems shipped with AI in the loop.'
};

export const projects: Project[] = [
	{
		slug: 'fleet',
		title: 'FLEET',
		eyebrow: 'Rascasone · 2024–now',
		summary:
			'Operations software for a vehicle workshop: fleet map, repairs, stock, purchasing, logistics, and invoicing, in one multi-tenant product.',
		role: 'UI/UX, Svelte frontend, Rails API. The largest system I have built on my own, with Cursor in the loop.',
		when: '2024–2026',
		context: 'Rascasone, Prague.',
		featured: true,
		tracks: ['fullstack', 'design', 'ai'],
		stack: [
			'Svelte',
			'Ruby on Rails',
			'PostgreSQL',
			'Multi-tenant theming',
			'PDF & XLSX export',
			'Cursor'
		],
		did: [
			'Shaped the product UI: dashboard, dense tables, status, and a map of the fleet across Czechia.',
			'Covered the workshop loop — vehicles, handover protocols, dispatching, repairs, insurance, team, customers, suppliers, parts, invoices, orders, and logistics.',
			'Each tenant brings its own logo, color, and language. SWM is the red one, in Czech or English, with its own sign-in screen.',
			'Roles, scheduled orders, and exports to PDF and spreadsheets.',
			'Built it as the primary author, using AI assistance for speed and keeping the architecture decisions myself.'
		],
		note: 'The live demo is a test tenant. I will send access with an application. The screenshots are from that demo, not a customer’s production data.',
		href: 'https://fleet-management-2.rascasone.dev/en/dashboard',
		hrefLabel: 'Open the demo',
		image: {
			src: '/portfolio/fleet.jpg',
			alt: 'FLEET dashboard with active repairs, workers, and a daily agenda of documents and invoices.'
		},
		gallery: [
			{
				src: '/portfolio/fleet-dark.jpg',
				alt: 'The same dashboard in dark mode.'
			},
			{
				src: '/portfolio/fleet-invoices.jpg',
				alt: 'Invoice list with totals for invoiced, paid, pending, and overdue amounts in Czech crowns.'
			},
			{
				src: '/portfolio/fleet-dark-invoices.jpg',
				alt: 'Invoices in dark mode, with paid, pending, and overdue totals.'
			},
			{
				src: '/portfolio/fleet-map.jpg',
				alt: 'Map of Czechia with vehicle pins in green, yellow, and red.'
			},
			{
				src: '/portfolio/fleet-dark-map.jpg',
				alt: 'Dark map zoomed in so city names are readable, with vehicles around Brno, Olomouc, and Třebíč.'
			},
			{
				src: '/portfolio/fleet-swm-login.jpg',
				alt: 'SWM tenant sign-in: red field, their logo, Czech copy.'
			},
			{
				src: '/portfolio/fleet-swm.jpg',
				alt: 'SWM overview in Czech, with their red mark in the sidebar.'
			},
			{
				src: '/portfolio/fleet-swm-logistics.jpg',
				alt: 'SWM logistics in dark mode: shipments, routes, and customs status.'
			},
			{
				src: '/portfolio/fleet-swm-vehicle.jpg',
				alt: 'An SWM vehicle record in English: photo, status, center, and fuel type.'
			}
		]
	},
	{
		slug: 'racemake',
		title: 'Racemake',
		eyebrow: 'Personal · telemetry',
		summary:
			'A racing telemetry desk. Upload a session, compare laps, and read where the time went — on the chart, on the track, and in one engineer’s sentence.',
		role: 'Design and development of the dashboard, from raw telemetry to a lap review a driver can act on.',
		when: 'Recent',
		context: 'Hosted on Cloudflare Workers.',
		featured: true,
		tracks: ['fullstack', 'design', 'ai'],
		stack: ['Cloudflare Workers', 'Data visualisation', 'Interactive track map'],
		did: [
			'Parsed session files into valid laps, best and slowest, and the corner that cost the most time.',
			'Drew throttle, brake, and steering across the lap, with laps overlaid.',
			'Placed the driven line on a track map and let the session play back.',
			'Turned the delta into a plain-language radio call: apex speed, brake pressure, throttle release, tyre temperature.'
		],
		note: 'Sample sessions are built in, and you can download a source file from the app to see the raw input.',
		href: 'https://racemake.shadow-hub.workers.dev/',
		hrefLabel: 'Open Racemake',
		image: {
			src: '/portfolio/racemake.jpg',
			alt: 'Dark telemetry dashboard with lap times, a throttle and brake chart, and a track map.'
		},
		gallery: [
			{
				src: '/portfolio/racemake-2.jpg',
				alt: 'A second session, laps around 2:13, with the loss concentrated in corner T4.'
			},
			{
				src: '/portfolio/racemake-2-map.jpg',
				alt: 'Track map and throttle, brake, and steering traces for that second session.'
			}
		]
	},
	{
		slug: 'reelvote',
		title: 'Reelvote',
		eyebrow: 'Startup · Svelte',
		summary:
			'A product for running a vote online or in the room. You draft it, publish it, and come back to a finished result.',
		role: 'Svelte application: the voting product UI, from sign-in to the vote itself.',
		when: 'Test app still online',
		context: 'Not a production launch. The build stamp on the test app reads May 2022.',
		featured: true,
		tracks: ['design', 'fullstack'],
		stack: ['Svelte', 'Product UI'],
		did: [
			'A ballot editor: welcome screen, questions, end screen, preview, and launch. Photos can be uploaded, or searched and taken from Unsplash.',
			'Results after the vote closes: turnout, start and end, and a chart per question.',
			'A schedule for when the vote opens and closes, and a link voters can open.',
			'A voter-facing screen, separate from the author’s draft, and an English product UI.'
		],
		note: 'Still a test environment. Happy to walk through a vote on a call.',
		href: 'https://app-test.reelvote.com',
		hrefLabel: 'Open the test app',
		image: {
			src: '/portfolio/reelvote-vote.jpg',
			alt: 'Reelvote ballot editor with a welcome screen, a question, and a voter preview about road trips.'
		},
		gallery: [
			{
				src: '/portfolio/reelvote-results.jpg',
				alt: 'Finished vote: two questions, start and end time, turnout, and the response charts.'
			},
			{
				src: '/portfolio/reelvote-question.jpg',
				alt: 'One question opened: a pie of the answers and the share of the vote each one took.'
			},
			{
				src: '/portfolio/reelvote-schedule.jpg',
				alt: 'Schedule for a draft vote: start, end, timezone, and the link voters will use.'
			},
			{
				src: '/portfolio/reelvote-unsplash.jpg',
				alt: 'Welcome-screen photo: search Unsplash, or switch to Upload and use your own image.'
			}
		]
	},
	{
		slug: 'jumpsoft',
		title: 'JumpSoft',
		eyebrow: 'JUMP soft · 2012–2022',
		summary:
			'The public site of a Bratislava software company. A long, bilingual marketing page built around their own platform, Twinzu.',
		role: 'Frontend. Gatsby and GraphQL. This is the company website, not the government systems it advertises.',
		when: '2012–2022',
		context: 'JUMP soft a.s., Bratislava. Slovak and English.',
		featured: true,
		tracks: ['fullstack', 'design'],
		stack: ['Gatsby', 'GraphQL', 'React', 'Bilingual content'],
		did: [
			'Built the marketing site as a frontend developer inside a ten-year engagement.',
			'Slovak and English, with the same story: layered architecture, the Twinzu platform, selected projects, contact.',
			'Designed the internal Twinzu IDE. The company site still shows it: a project tree, module operations, and a code pane in one dark window.'
		],
		href: 'https://www.jump-soft.com/en/',
		hrefLabel: 'Visit jump-soft.com',
		image: {
			src: '/portfolio/jumpsoft.jpg',
			alt: 'JumpSoft homepage with a violet gradient sculpture and the line “We are software engineers.”'
		},
		gallery: [
			{
				src: '/portfolio/jumpsoft-twinzu.jpg',
				alt: 'Twinzu page: the platform story, and the three parts — Twinzu, Java, and the IDE.'
			},
			{
				src: '/portfolio/jumpsoft-ide.jpg',
				alt: 'Twinzu IDE: project tree on the left, module operations and a code editor on the right.'
			}
		]
	},
	{
		slug: 'audiopoviedky',
		title: 'Audiopoviedky',
		eyebrow: 'KK Bagala · solo',
		summary:
			'An iPhone app for a Slovak audiobook publisher. Dramatized short stories, a library, and an account — designed and built by me.',
		role: 'Sole author of the React Native app: design and development.',
		when: 'Shipped on the App Store',
		context: 'Publisher Koloman Kertész Bagala. Books category. 5.0 from a small set of ratings.',
		featured: false,
		tracks: ['design', 'fullstack'],
		stack: ['React Native', 'iOS'],
		did: [
			'Designed and shipped the app on my own, for a publisher who has run a short-story prize since 1996.',
			'Library, playback, and account screens for dramatized readings.',
			'A complete mobile product, not a styling pass on someone else’s codebase.'
		],
		href: 'https://apps.apple.com/sk/app/audiopoviedky/id1542334497',
		hrefLabel: 'App Store',
		image: {
			src: '/portfolio/audiopoviedky.jpg',
			alt: 'App Store page for Audiopoviedky showing the player, a story, and the account screen.'
		},
		gallery: [
			{
				src: '/portfolio/audio-iphone-1.jpg',
				alt: 'iPhone. Sign-in, and a menu of newest, popular, shortest, and longest stories, plus authors, narrators, and series.'
			},
			{
				src: '/portfolio/audio-iphone-2.jpg',
				alt: 'iPhone. A story list with cover, narrator, length, and the player scrubber sitting in the catalogue.'
			},
			{
				src: '/portfolio/audio-iphone-3.jpg',
				alt: 'iPhone. Authors, grouped A to Z, each with a portrait and how many recordings they have.'
			},
			{
				src: '/portfolio/audio-ipad-1.jpg',
				alt: 'iPad. The same sign-in and catalogue menu, with the publisher mark and account actions on the wide screen.'
			},
			{
				src: '/portfolio/audio-ipad-2.jpg',
				alt: 'iPad. Playback of a story inside a long catalogue, with the progress bar spanning the width.'
			},
			{
				src: '/portfolio/audio-ipad-3.jpg',
				alt: 'iPad. An author page: a large portrait, a short biography, and the rest of the alphabet beside it.'
			}
		]
	},
	{
		slug: 'eznamka',
		title: 'eZnamka',
		eyebrow: 'Kedros · design',
		summary:
			'The electronic motorway vignette for drivers in Slovakia. I worked on the design and styling of the React Native app.',
		role: 'Design and styling. The app is published by TollNet. I did not own the product.',
		when: 'Within Kedros, 2017–2022',
		context: 'National travel app. React Native.',
		featured: false,
		tracks: ['design'],
		stack: ['React Native', 'UI design', 'Interface styling'],
		did: [
			'Designed and styled the mobile interface: vignette list, validity, price, and the empty state.',
			'Worked as frontend designer/developer at Kedros, on a product used by drivers rather than by a closed intranet.'
		],
		note: 'Scope matters here. Design and styling, inside a larger team and a company that is not mine.',
		href: 'https://apps.apple.com/cz/app/eznamka/id1040605704',
		hrefLabel: 'App Store',
		image: {
			src: '/portfolio/eznamka.jpg',
			alt: 'App Store screenshots of eZnamka listing electronic vignettes, prices, and validity dates.'
		},
		gallery: [
			{
				src: '/portfolio/eznamka-iphone-1.jpg',
				alt: 'iPhone. Empty state: buy a vignette or add one already paid for, with Validity, Correct, and Submission along the bottom.'
			},
			{
				src: '/portfolio/eznamka-iphone-2.jpg',
				alt: 'iPhone. Three vignettes for Slovak plates, with validity dates and prices of €10 and €50.'
			},
			{
				src: '/portfolio/eznamka-iphone-3.jpg',
				alt: 'iPhone. Actions on one plate: payment confirmation, correct the vignette data, or remove it.'
			},
			{
				src: '/portfolio/eznamka-iphone-4.jpg',
				alt: 'iPhone. The more menu, with Settings and Information under the eZnamka mark.'
			},
			{
				src: '/portfolio/eznamka-ipad-1.jpg',
				alt: 'iPad. The same empty state, with the add button and the four sections spread across the wider bar.'
			},
			{
				src: '/portfolio/eznamka-ipad-2.jpg',
				alt: 'iPad. The vignette list laid out in wide cards: ten-day, yearly car, and yearly trailer.'
			},
			{
				src: '/portfolio/eznamka-ipad-3.jpg',
				alt: 'iPad. The same plate actions — confirmation, correction, remove — on the tablet layout.'
			}
		]
	},
	{
		slug: 'mytocz',
		title: 'MYTO.GOV.CZ',
		eyebrow: 'Kedros · design',
		summary:
			'The Czech truck-toll app. Same kind of work as eZnamka: the interface, not the toll system behind it.',
		role: 'Design and styling on the React Native app.',
		when: 'Within Kedros, 2017–2022',
		context: 'Published by TollNet as MYTO.GOV.CZ.',
		featured: false,
		tracks: ['design'],
		stack: ['React Native', 'UI design'],
		did: [
			'Styled the account, balance check, and prepaid top-up flows.',
			'Kept the visual system consistent with a public finance product: dense numbers, clear primary actions.'
		],
		note: 'Design and styling. TollNet is the developer of record.',
		href: 'https://apps.apple.com/cz/app/myto-gov-cz/id1477200077',
		hrefLabel: 'App Store',
		image: {
			src: '/portfolio/mytocz.jpg',
			alt: 'App Store screenshots of the Czech toll app showing balance, account details, and a top-up.'
		},
		gallery: [
			{
				src: '/portfolio/myto-iphone-1.jpg',
				alt: 'iPhone. Login, with the same credentials as the Self Zone on mytocz.eu, plus eIdentity.'
			},
			{
				src: '/portfolio/myto-iphone-2.jpg',
				alt: 'iPhone. The account drawer: customer detail, toll calculator, settings, and information.'
			},
			{
				src: '/portfolio/myto-iphone-3.jpg',
				alt: 'iPhone. A prepaid toll account: plate, country, account number, active status, and the balance in crowns.'
			},
			{
				src: '/portfolio/myto-iphone-4.jpg',
				alt: 'iPhone. Account balance, with a note that the credit is sufficient and a top-up action.'
			},
			{
				src: '/portfolio/myto-ipad-1.jpg',
				alt: 'iPad. The login screen stretched for the tablet, with login and eIdentity as full-width actions.'
			},
			{
				src: '/portfolio/myto-ipad-2.jpg',
				alt: 'iPad. The same account drawer — customer detail, toll calculator, settings, information — across the wide screen.'
			},
			{
				src: '/portfolio/myto-ipad-3.jpg',
				alt: 'iPad. A prepaid toll account on the tablet, with correspondence and contact folded underneath the balance.'
			}
		]
	},
	{
		slug: 'globe',
		title: 'Globe Maker',
		eyebrow: 'Personal',
		summary:
			'Pick a place on the map and export it as a square print, or as meridian stripes you glue onto a globe. The pictures are the output: a lit sphere, a wall map, a globe assembled on a table.',
		role: 'Own product. Interface, API, and the processor that warps the map into stripes.',
		when: 'Personal project',
		context: 'globe.rgb.sk',
		featured: false,
		tracks: ['design', 'fullstack'],
		stack: [
			'Hugin / nona',
			'SvelteKit',
			'Python',
			'Docker',
			'ImageMagick',
			'Pillow',
			'Tailwind',
			'Leaflet',
			'MapLibre',
			'Three.js',
			'Cloudflare Workers',
			'Hono',
			'R2',
			'FastAPI',
			'PayPal'
		],
		did: [
			'Search or click a region, then choose map or globe mode, ground size, pixels, and JPEG or SVG.',
			'SvelteKit front end, with Leaflet and MapLibre for the map and Three.js for the sphere. Latest planet keeps every finished globe you can spin.',
			'API on a Cloudflare Worker (Hono). Jobs and the finished zip live in R2. Globe stripes are paid through PayPal; a flat map stays free.',
			'A separate processor, FastAPI on Docker, renders vector tiles, warps them with the Panotools stripe cutter, and finishes the sheets with Pillow and ImageMagick.'
		],
		href: 'https://globe.rgb.sk',
		hrefLabel: 'Open Globe Maker',
		image: {
			src: '/portfolio/globe-planet.jpg',
			alt: 'Latest planet: a spun globe of Zamość against a star field, with a shelf of earlier planets beside it.',
			focus: 'center'
		},
		gallery: [
			{
				src: '/portfolio/globe-lamp.webp',
				alt: 'A glowing globe lamp printed with a city map, sitting on a side table at night.'
			},
			{
				src: '/portfolio/globe.jpg',
				alt: 'Globe Maker in light mode: world map, size sliders, and JPEG or SVG export.'
			},
			{
				src: '/portfolio/globe-dark.jpg',
				alt: 'The same app in dark mode.'
			},
			{
				src: '/portfolio/globe-assembly.webp',
				alt: 'Printed map stripes, scissors, and a globe being assembled on a wooden table.'
			},
			{
				src: '/portfolio/globe-print.webp',
				alt: 'A framed map print hanging on a living-room wall.'
			},
			{
				src: '/portfolio/globe-berlin.webp',
				alt: 'A pale globe lamp of Berlin, with Prenzlauer Berg readable on the surface.'
			}
		]
	},
	{
		slug: 'partnercheck',
		title: 'PartnerCheck',
		eyebrow: 'Personal',
		summary:
			'A phone number becomes two colors. The web app lets you add a person, put two of them side by side, and see whether the colors agree. The marketing site explains the idea.',
		role: 'Concept, writing, and both interfaces: the site and the web app.',
		when: 'Personal project',
		context: 'partnercheck.huba.sk. Contacts stay on the device.',
		featured: false,
		tracks: ['design'],
		stack: ['Web app', 'Next.js', 'Tailwind', 'Flutter'],
		did: [
			'Web app: add a name and a number, then set two people side by side. The outer field is their color, the band along the bottom is the reversed digits.',
			'The same colors run further: a Tetris board, a plasma field, and a lava lamp.',
			'Marketing site in many languages, with a dark mode. Nothing is uploaded. The numbers stay in the browser.'
		],
		href: 'https://partnercheck.huba.sk/app/?lang=en',
		hrefLabel: 'Open the web app',
		image: {
			src: '/portfolio/partnercheck-compare.jpg',
			alt: 'Alice and Mike side by side in the web app, each card their own outer and inner color.',
			focus: 'center'
		},
		gallery: [
			{
				src: '/portfolio/partnercheck-about.jpg',
				alt: 'About screen: six digits become a color, and the same colors can play Tetris, plasma, or lava.'
			},
			{
				src: '/portfolio/partnercheck-tetris.jpg',
				alt: 'Tetris played in the greens and purple of a contact’s colors.'
			},
			{
				src: '/portfolio/partnercheck-plasma.jpg',
				alt: 'A plasma field drawn from the same purple and green.'
			},
			{
				src: '/portfolio/partnercheck-form.jpg',
				alt: 'Adding a contact by name and phone number.'
			},
			{
				src: '/portfolio/partnercheck-app-phone.jpg',
				alt: 'The web app at phone width, with add-contact and the pro tools.'
			},
			{
				src: '/portfolio/partnercheck.jpg',
				alt: 'Marketing page: “Coincidence does not exist,” with color cards for three people.'
			}
		]
	},
	{
		slug: 'shadowy-quarter',
		title: 'The Shadowy Quarter',
		eyebrow: 'Roblox · Lua',
		summary:
			'A small game about the Jewish quarter in Třebíč, where I live. Weather, vehicles, a balloon, and church bells that follow the real clock.',
		role: 'First project in Lua. Built for neighbours and their children, and published on Roblox.',
		when: '2026',
		context: 'Place by @shadow_huba. A neighbourhood piece, not a live-ops game.',
		featured: false,
		tracks: ['design'],
		stack: ['Lua', 'Roblox', 'Open Street Map'],
		did: [
			'Modelled a walk through the quarter, with keys that change the weather — including rain that can flood.',
			'Added cars, a bike, a hot-air balloon, and a dragon.',
			'Synced the tower bells to the real time in Třebíč.',
			'Used period photographs and short life stories of people who were deported.'
		],
		href: 'https://www.roblox.com/games/104300926619211/The-Shadowy-Quarter',
		hrefLabel: 'Open on Roblox',
		image: {
			src: '/portfolio/roblox-square.jpg',
			alt: 'The square in Třebíč: clock tower, race tracks, and a ferris wheel.',
			focus: 'center'
		},
		gallery: [
			{
				src: '/portfolio/roblox-piano.jpg',
				alt: 'A pianist in the lane, with a line of dancers behind them in sepia toned world.'
			},
			{
				src: '/portfolio/roblox-cat.jpg',
				alt: 'A black cat with a star on its chest, standing in an alley of the quarter.'
			},
			{
				src: '/portfolio/roblox-photo.jpg',
				alt: 'A period photograph of the town, placed in the game world.'
			},
			{
				src: '/portfolio/roblox-dragon.jpg',
				alt: 'A dragon flying through the ferris wheel above the square.'
			}
		]
	}
];

export function getProject(slug: string) {
	return projects.find((project) => project.slug === slug);
}

export const featured = projects.filter((project) => project.featured);
export const further = projects.filter((project) => !project.featured);

export const tracks = [
	{
		id: 'design' as const,
		title: 'Design',
		text: 'I started in art school, then spent years teaching designers how a layout survives contact with a browser. Figma, interface structure, and the visual system of a product are part of the job, not a handoff I wait for.'
	},
	{
		id: 'fullstack' as const,
		title: 'Full-stack',
		text: 'Svelte and SvelteKit are home. React, Next, and Gatsby are fluent. On the server I use Rails or a Node API, with PostgreSQL, and I have put Docker and pipelines into production.'
	},
	{
		id: 'ai' as const,
		title: 'AI-assisted',
		text: 'I work in Cursor with skills, hooks, and subagents. The point is not to generate more code. FLEET is the proof: a large product, shipped with AI in the loop, and with a person still responsible for it.'
	}
];

export const skillGroups = [
	{
		title: 'Interface',
		items: ['UI / UX', 'Figma', 'Prototyping', 'Design systems', 'SVG', 'Art direction']
	},
	{
		title: 'Frontend',
		items: [
			'Svelte',
			'SvelteKit',
			'TypeScript',
			'React',
			'Next.js',
			'Gatsby',
			'React Native',
			'Tailwind',
			'shadcn',
			'MUI'
		]
	},
	{
		title: 'Backend & delivery',
		items: [
			'Ruby on Rails',
			'Node.js',
			'express.js',
			'oAuth',
			'Python',
			'GraphQL',
			'RestAPI',
			'Swagger',
			'PostgreSQL',
			'Headless CMS',
			'ExpressionEngine',
			'Docker'
		]
	},
	{
		title: 'With AI',
		items: ['Cursor', 'Global agent skills', 'Per project skills', 'Hooks', 'Dedicated subagents', 'Code review of generated work']
	}
];

export const roles = [
	{
		org: 'Rascasone',
		title: 'Frontend developer, UI/UX designer',
		when: 'Nov 2024 — present',
		place: 'Prague · remote',
		text: 'Product design and frontend for client systems. FLEET is the large one: workshop, fleet, stock, and invoicing, Svelte in front of Rails.'
	},
	{
		org: 'Chyron',
		title: 'Frontend developer',
		when: 'Sep 2023 — Mar 2024',
		place: 'Brno',
		text: 'Seven months of frontend work for a US broadcast-graphics company.'
	},
	{
		org: 'Kedros',
		title: 'Frontend designer / developer',
		when: 'Oct 2017 — 2022',
		place: 'Slovakia',
		text: 'Interface work on product teams, including design and styling for the eZnamka and MYTO.GOV.CZ apps.'
	},
	{
		org: 'JUMP soft',
		title: 'Frontend developer',
		when: 'Mar 2012 — 2022',
		place: 'Slovakia',
		text: 'A decade of CSS, JavaScript, and UI. The public site is the Gatsby and GraphQL piece linked above.'
	},
	{
		org: 'TV5MONDE',
		title: 'Multimedia designer',
		when: 'Mar 2013 — 2020',
		place: 'Europe',
		text: 'Web and screen banners for the broadcaster.'
	},
	{
		org: 'Self-employed',
		title: 'Studio, then independent',
		when: 'Dec 2000 — present',
		place: 'Remote · Czech trade licence',
		text: 'A three-person studio until 2014, then freelance. The employed roles above sat inside that, mostly remote, often in parallel.'
	}
];

export const teaching = [
	{
		org: 'Academy of Fine Arts and Design, Bratislava',
		when: '2002 — 2016',
		text: 'Web and multimedia, for designers.'
	},
	{
		org: 'Private Secondary School of Design, Bratislava',
		when: '2009 — 2018',
		text: 'Webdesign and multimedia.'
	},
	{
		org: 'Paneuropean University, Bratislava',
		when: '2010 — 2012',
		text: 'Webdesign and multimedia.'
	},
	{
		org: 'FaVU, Brno',
		when: '2006 — 2008',
		text: 'Lecturer in the multimedia department.'
	}
];

export const education = [
	{
		school: 'Academy of Fine Arts and Design, Bratislava',
		detail: 'Master’s degree, photography and multimedia',
		when: '1994 — 2000'
	},
	{
		school: 'Gerrit Rietveld Academie, Amsterdam',
		detail: 'Bachelor’s degree, audiovisual',
		when: '1997 — 1998'
	},
	{
		school: 'ŠUŘ, Brno',
		detail: 'Photography',
		when: '1988 — 1991'
	}
];

export const languages = [
	['Slovak', 'Native'],
	['Czech', 'Native'],
	['English', 'Professional'],
	['Dutch', 'Professional']
] as const;

export const earlier = [
	{ href: 'https://opobchod.cz/', label: 'opobchod.cz', note: 'HTML remake of an early shop made in Flash. 2007. Build only.' },
	{ href: 'https://ruudvanmegen.nl/', label: 'ruudvanmegen.nl', note: 'ExpressionEngine 1, 2008. Build only.' },
	{
		href: 'https://vanmegentrading.nl/',
		label: 'vanmegentrading.nl',
		note: 'ExpressionEngine 1, 2009. Build only.'
	},
	{
		href: 'https://www.banskastanica.sk/',
		label: 'banskastanica.sk',
		note: 'ExpressionEngine 1, 2009. Design and build.'
	},
	{ href: 'https://www.fokbros.nl/', label: 'fokbros.nl', note: 'ExpressionEngine 2, 2010. Build only.' },
	{
		href: 'https://www.retart.sk/',
		label: 'retart.sk',
		note: 'ExpressionEngine 2, 2010. CartThrob shop. Build only.'
	},
	{
		href: 'https://www.skoladesignu.sk/',
		label: 'skoladesignu.sk',
		note: 'ExpressionEngine 2, 2010. Art school. Design and build.'
	},
	{
		href: 'https://www.hempseedoil.eu/',
		label: 'hempseedoil.eu',
		note: 'ExpressionEngine 2, 2011. Several sites, one install. Design and build.'
	},
	{
		href: 'https://www.hempseedprotein.eu/',
		label: 'hempseedprotein.eu',
		note: 'ExpressionEngine 2, 2011. Same multi-site setup. Design and build.'
	},
	{
		href: 'https://www.showportal.sk/',
		label: 'showportal.sk',
		note: 'ExpressionEngine 2, 2012. Artist portal, orders and offers. Design and build.'
	},
	{
		href: 'https://www.ryvera.cz/',
		label: 'ryvera.cz',
		note: 'ExpressionEngine 2, 2012. Custom shop. Design and build.'
	},
	{
		href: 'https://www.cbdepot.eu/',
		label: 'cbdepot.eu',
		note: 'ExpressionEngine 2, 2013. Multi-site. Design and build.'
	},
	{
		href: 'https://www.banskastanica.sk/edition',
		label: 'banskastanica.sk/edition',
		note: 'ExpressionEngine 1, 2014. Edition subsite. Design and build.'
	},
	{
		href: 'https://www.skoladesignu.sk/sumec/',
		label: 'galeriasumec.sk',
		note: 'ExpressionEngine 2, 2014. Gallery, shared install. Design and build.'
	},
	{
		href: 'https://www.diverzita.sk/',
		label: 'diverzita.sk',
		note: 'ExpressionEngine 2, 2018. Community site. Design and build.'
	},
	{
		href: 'https://supkaba.sk/',
		label: 'supkaba.sk',
		note: 'ExpressionEngine 5, 2020. Art school. Build only.'
	},
	{
		href: 'https://mikyta.com/',
		label: 'mikyta.com',
		note: 'ExpressionEngine 6, 2021. Artist’s portfolio. Build only.'
	},
	{
		href: 'https://kcklastor.sk/',
		label: 'kcklastor.sk',
		note: 'ExpressionEngine 6, 2022. Community house. Design and build.'
	}
];
