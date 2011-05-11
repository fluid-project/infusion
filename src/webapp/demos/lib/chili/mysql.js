/*
===============================================================================
Chili is the jQuery code highlighter plugin
...............................................................................
LICENSE: http://www.opensource.org/licenses/mit-license.php
WEBSITE: http://noteslog.com/chili/

											   Copyright 2008 / Andrea Ercolino
===============================================================================
*/

{
	  _name: "sql"
	, _case: false
	, _main: {
		  mlcom: {
			  _match: /\/\*[^*]*\*+([^\/][^*]*\*+)*\// 
			, _style: "color: gray;"
		}
		, com: {
			  _match: /(?:--\s+.*)|(?:[^\\]\#.*)/ 
			, _style: "color: green;"
		}
		, string: {
			  _match: /([\"\'])(?:(?:[^\1\\\r\n]*?(?:\1\1|\\.))*[^\1\\\r\n]*?)\1/ 
			, _style: "color: purple;"
		}
		, quid: {
			  _match: /(`)(?:(?:[^\1\\\r\n]*?(?:\1\1|\\.))*[^\1\\\r\n]*?)\1/ 
			, _style: "color: fuchsia;"
		}
		, value: {
			  _match: /\b(?:NULL|TRUE|FALSE)\b/ 
			, _style: "color: gray; font-weight: bold;"
		}
		, number: {
			  _match: /\b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b/ 
			, _style: "color: red;"
		}
		, hexnum: {
			  _match: /\b0[xX][\dA-Fa-f]+\b|\b[xX]([\'\"])[\dA-Fa-f]+\1/ 
			, _style: "color: red; font-weight: bold;"
		}
		, variable: {
			  _match: /@([$.\w]+|([`\"\'])(?:(?:[^\2\\\r\n]*?(?:\2\2|\\.))*[^\2\\\r\n]*?)\2)/
			, _replace: '<span class="keyword">@</span><span class="variable">$1</span>'
			, _style: "color: #4040c2;"
		}
		, keyword: {
			  _match: /\b(?:A(?:CTION|DD|FTER|G(?:AINST|GREGATE)|L(?:GORITHM|L|TER)|N(?:ALYZE|D|Y)|S(?:C(?:II|)|ENSITIVE|)|UTO_INCREMENT|VG(?:_ROW_LENGTH|))|B(?:ACKUP|DB|E(?:FORE|GIN|RKELEYDB|TWEEN)|I(?:GINT|N(?:ARY|LOG)|T)|LOB|O(?:OL(?:EAN|)|TH)|TREE|Y(?:TE|))|C(?:A(?:CHE|LL|S(?:CADE(?:D|)|E))|H(?:A(?:IN|NGE(?:D|)|R(?:ACTER|SET|))|ECK(?:SUM|))|IPHER|L(?:IENT|OSE)|O(?:DE|L(?:LAT(?:E|ION)|UMN(?:S|))|M(?:M(?:ENT|IT(?:TED|))|P(?:ACT|RESSED))|N(?:CURRENT|DITION|NECTION|S(?:ISTENT|TRAINT)|T(?:AINS|INUE)|VERT))|R(?:EATE|OSS)|U(?:BE|R(?:RENT_(?:DATE|TIME(?:STAMP|)|USER)|SOR)))|D(?:A(?:T(?:A(?:BASE(?:S|)|)|E(?:TIME|))|Y(?:_(?:HOUR|MI(?:CROSECOND|NUTE)|SECOND)|))|E(?:ALLOCATE|C(?:IMAL|LARE|)|F(?:AULT|INER)|L(?:AY(?:ED|_KEY_WRITE)|ETE)|S(?:C(?:RIBE|)|_KEY_FILE)|TERMINISTIC)|I(?:RECTORY|S(?:ABLE|CARD|TINCT(?:ROW|))|V)|O(?:UBLE|)|ROP|U(?:AL|MPFILE|PLICATE)|YNAMIC)|E(?:ACH|LSE(?:IF|)|N(?:ABLE|CLOSED|D|GINE(?:S|)|UM)|RRORS|SCAPE(?:D|)|VENTS|X(?:ECUTE|I(?:STS|T)|P(?:ANSION|LAIN)|TENDED))|F(?:A(?:LSE|ST)|ETCH|I(?:ELDS|LE|RST|XED)|L(?:OAT(?:4|8|)|USH)|O(?:R(?:CE|EIGN|)|UND)|R(?:AC_SECOND|OM)|U(?:LL(?:TEXT|)|NCTION))|G(?:E(?:OMETRY(?:COLLECTION|)|T_FORMAT)|LOBAL|R(?:ANT(?:S|)|OUP))|H(?:A(?:NDLER|SH|VING)|ELP|IGH_PRIORITY|O(?:STS|UR(?:_(?:MI(?:CROSECOND|NUTE)|SECOND)|)))|I(?:DENTIFIED|F|GNORE|MPORT|N(?:DEX(?:ES|)|FILE|N(?:ER|O(?:BASE|DB))|OUT|SE(?:NSITIVE|RT(?:_METHOD|))|T(?:1|2|3|4|8|E(?:GER|RVAL)|O|)|VOKER|)|O_THREAD|S(?:OLATION|SUER|)|TERATE)|JOIN|K(?:EY(?:S|)|ILL)|L(?:A(?:NGUAGE|ST)|E(?:A(?:DING|VE(?:S|))|FT|VEL)|I(?:KE|MIT|NES(?:TRING|))|O(?:AD|C(?:AL(?:TIME(?:STAMP|)|)|K(?:S|))|GS|NG(?:BLOB|TEXT|)|OP|W_PRIORITY))|M(?:A(?:STER(?:_(?:CONNECT_RETRY|HOST|LOG_(?:FILE|POS)|P(?:ASSWORD|ORT)|S(?:ERVER_ID|SL(?:_(?:C(?:A(?:PATH|)|ERT|IPHER)|KEY)|))|USER)|)|TCH|X_(?:CONNECTIONS_PER_HOUR|QUERIES_PER_HOUR|ROWS|U(?:PDATES_PER_HOUR|SER_CONNECTIONS)))|E(?:DIUM(?:BLOB|INT|TEXT|)|RGE)|I(?:CROSECOND|DDLEINT|GRATE|N(?:UTE(?:_(?:MICROSECOND|SECOND)|)|_ROWS))|O(?:D(?:E|IF(?:IES|Y)|)|NTH)|U(?:LTI(?:LINESTRING|PO(?:INT|LYGON))|TEX))|N(?:A(?:ME(?:S|)|T(?:IONAL|URAL))|CHAR|DB(?:CLUSTER|)|E(?:W|XT)|O(?:NE|T|_WRITE_TO_BINLOG|)|U(?:LL|MERIC)|VARCHAR)|O(?:FFSET|LD_PASSWORD|N(?:E(?:_SHOT|)|)|P(?:EN|TI(?:MIZE|ON(?:ALLY|)))|R(?:DER|)|UT(?:ER|FILE|))|P(?:A(?:CK_KEYS|RTIAL|SSWORD)|HASE|O(?:INT|LYGON)|R(?:E(?:CISION|PARE|V)|I(?:MARY|VILEGES)|OCE(?:DURE|SS(?:LIST|)))|URGE)|QU(?:ARTER|ERY|ICK)|R(?:AID(?:0|_(?:CHUNKS(?:IZE|)|TYPE))|E(?:A(?:D(?:S|)|L)|COVER|DUNDANT|FERENCES|GEXP|L(?:AY_(?:LOG_(?:FILE|POS)|THREAD)|EASE|OAD)|NAME|P(?:AIR|EAT(?:ABLE|)|L(?:ACE|ICATION))|QUIRE|S(?:ET|T(?:ORE|RICT)|UME)|TURN(?:S|)|VOKE)|IGHT|LIKE|O(?:LL(?:BACK|UP)|UTINE|W(?:S|_FORMAT|))|TREE)|S(?:AVEPOINT|CHEMA(?:S|)|E(?:C(?:OND(?:_MICROSECOND|)|URITY)|LECT|NSITIVE|PARATOR|RIAL(?:IZABLE|)|SSION|T)|H(?:ARE|OW|UTDOWN)|I(?:GNED|MPLE)|LAVE|MALLINT|NAPSHOT|O(?:ME|NAME|UNDS)|P(?:ATIAL|ECIFIC)|QL(?:EXCEPTION|STATE|WARNING|_(?:B(?:IG_RESULT|UFFER_RESULT)|CA(?:CHE|LC_FOUND_ROWS)|NO_CACHE|SMALL_RESULT|T(?:HREAD|SI_(?:DAY|FRAC_SECOND|HOUR|M(?:INUTE|ONTH)|QUARTER|SECOND|WEEK|YEAR)))|)|SL|T(?:A(?:RT(?:ING|)|TUS)|O(?:P|RAGE)|R(?:AIGHT_JOIN|I(?:NG|PED)))|U(?:BJECT|PER|SPEND))|T(?:ABLE(?:S(?:PACE|)|)|E(?:MP(?:ORARY|TABLE)|RMINATED|XT)|HEN|I(?:ME(?:STAMP(?:ADD|DIFF|)|)|NY(?:BLOB|INT|TEXT))|O|R(?:A(?:ILING|NSACTION)|IGGER(?:S|)|U(?:E|NCATE))|YPE(?:S|))|U(?:N(?:COMMITTED|D(?:EFINED|O)|I(?:CODE|ON|QUE)|KNOWN|LOCK|SIGNED|TIL)|P(?:DATE|GRADE)|S(?:AGE|E(?:R(?:_RESOURCES|)|_FRM|)|ING)|TC_(?:DATE|TIME(?:STAMP|)))|V(?:A(?:LUE(?:S|)|R(?:BINARY|CHAR(?:ACTER|)|IABLES|YING))|IEW)|W(?:ARNINGS|EEK|H(?:E(?:N|RE)|ILE)|ITH|ORK|RITE)|X(?:509|A|OR)|YEAR(?:_MONTH|)|ZEROFILL)\b/
			, _style: "color: navy; font-weight: bold;"
		}
		, 'function': {
			  _match: /\b(?:A(?:BS|COS|DD(?:DATE|TIME)|ES_(?:DECRYPT|ENCRYPT)|REA|S(?:BINARY|IN|TEXT|WK(?:B|T))|TAN(?:2|))|B(?:ENCHMARK|I(?:N|T_(?:AND|COUNT|LENGTH|OR|XOR)))|C(?:AST|E(?:IL(?:ING|)|NTROID)|HAR(?:ACTER_LENGTH|_LENGTH)|O(?:ALESCE|ERCIBILITY|MPRESS|N(?:CAT(?:_WS|)|NECTION_ID|V(?:ERT_TZ|))|S|T|UNT)|R(?:C32|OSSES)|UR(?:DATE|TIME))|D(?:A(?:TE(?:DIFF|_(?:ADD|FORMAT|SUB))|Y(?:NAME|OF(?:MONTH|WEEK|YEAR)))|E(?:CODE|GREES|S_(?:DECRYPT|ENCRYPT))|I(?:MENSION|SJOINT))|E(?:LT|N(?:C(?:ODE|RYPT)|DPOINT|VELOPE)|QUALS|X(?:P(?:ORT_SET|)|T(?:ERIORRING|RACT)))|F(?:I(?:ELD|ND_IN_SET)|LOOR|O(?:RMAT|UND_ROWS)|ROM_(?:DAYS|UNIXTIME))|G(?:E(?:OM(?:COLLFROM(?:TEXT|WKB)|ETRY(?:COLLECTIONFROM(?:TEXT|WKB)|FROM(?:TEXT|WKB)|N|TYPE)|FROM(?:TEXT|WKB))|T_LOCK)|LENGTH|R(?:EATEST|OUP_(?:CONCAT|UNIQUE_USERS)))|HEX|I(?:FNULL|N(?:ET_(?:ATON|NTOA)|STR|TER(?:IORRINGN|SECTS))|S(?:CLOSED|EMPTY|NULL|SIMPLE|_(?:FREE_LOCK|USED_LOCK)))|L(?:AST_(?:DAY|INSERT_ID)|CASE|E(?:AST|NGTH)|INE(?:FROM(?:TEXT|WKB)|STRINGFROM(?:TEXT|WKB))|N|O(?:AD_FILE|CATE|G(?:10|2|)|WER)|PAD|TRIM)|M(?:A(?:KE(?:DATE|TIME|_SET)|STER_POS_WAIT|X)|BR(?:CONTAINS|DISJOINT|EQUAL|INTERSECTS|OVERLAPS|TOUCHES|WITHIN)|D5|I(?:D|N)|LINEFROM(?:TEXT|WKB)|ONTHNAME|PO(?:INTFROM(?:TEXT|WKB)|LYFROM(?:TEXT|WKB))|ULTI(?:LINESTRINGFROM(?:TEXT|WKB)|PO(?:INTFROM(?:TEXT|WKB)|LYGONFROM(?:TEXT|WKB))))|N(?:AME_CONST|OW|U(?:LLIF|M(?:GEOMETRIES|INTERIORRINGS|POINTS)))|O(?:CT(?:ET_LENGTH|)|RD|VERLAPS)|P(?:ERIOD_(?:ADD|DIFF)|I|O(?:INT(?:FROM(?:TEXT|WKB)|N)|LY(?:FROM(?:TEXT|WKB)|GONFROM(?:TEXT|WKB))|SITION|W(?:ER|)))|QUOTE|R(?:A(?:DIANS|ND)|E(?:LEASE_LOCK|VERSE)|O(?:UND|W_COUNT)|PAD|TRIM)|S(?:E(?:C_TO_TIME|SSION_USER)|HA(?:1|)|I(?:GN|N)|LEEP|OUNDEX|PACE|QRT|RID|T(?:ARTPOINT|D(?:DEV(?:_(?:POP|SAMP)|)|)|R(?:CMP|_TO_DATE))|U(?:B(?:DATE|STR(?:ING(?:_INDEX|)|)|TIME)|M)|YS(?:DATE|TEM_USER))|T(?:AN|IME(?:DIFF|_(?:FORMAT|TO_SEC))|O(?:UCHES|_DAYS)|RIM)|U(?:CASE|N(?:COMPRESS(?:ED_LENGTH|)|HEX|I(?:QUE_USERS|X_TIMESTAMP))|PPER|UID)|V(?:AR(?:IANCE|_(?:POP|SAMP))|ERSION)|W(?:EEK(?:DAY|OFYEAR)|ITHIN)|X|Y(?:EARWEEK|))(?=\()/ 
			, _style: "color: #e17100;"
		}
		, id: {
			  _match: /[$\w]+/ 
			, _style: "color: maroon;"
		}
	}
}

