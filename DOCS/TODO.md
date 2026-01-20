document file and then implement those things mentioned in that with mainly

after login based upon role :
->navigate to thier respective dasboard(admin/supervisor/surveyor)
->after login every page should consist, collapsive sidebar and after that in only surveyor page there will be extra bottom bar to give real app feel to surveyors.
->admin can create all kind of users, can see all slums details and can check which slum has been assigned to whom , almost have ability to access every functionality other than survey
->supervisor can only other supervisor and can create new slums and assign slums to surveyors and mange them
->survyors can only do surveys, after navigating their dashboard they will get two option, ist one slum survey for assigned slum and then 2nd option is household survey for assigned slum(no of HHs will be there in single slum)
-> both survey form questionalies are there in DOCS can be checked and if needed any modifications based on the form apply on both frontend and backend
->in result, as output i want, admin will create a supervisor and a surveyor and will view all other status progress which we can focus later and then supervisor will create slums with basic details like slum name, id, stare district, city etc.. and then assign it surveyor and check for progress, surveyor will check for assignes slum and do slum can do any surevy(HH/slum) first, if he started slum , he has to complte it perfectly, as it one time need survey for whole sluma dnt hen for hpusehold suvey, it involves multiple suveys like same hh form for again and again no of time untill all Households finished in the slum, this all data will sent to DB, to the respective slum survey with single record for a slum in slum survey collection/model but no of Household records for same slum in household survey collection/model

implement
