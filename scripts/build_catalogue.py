import json, csv, re, datetime, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
os.makedirs(OUT, exist_ok=True)
TODAY = datetime.date.today().isoformat()

HEALTH = [
 ("Daily Wellness", "Everyday nutrition formulations for general health maintenance."),
 ("Men's Health", "Vitality, stamina and wellness formulations for men."),
 ("Women's Health", "Nutrition formulations for women across life stages."),
 ("Beauty Nutrition", "Inside-out nutrition for skin, hair and nails."),
 ("Sports Nutrition", "Performance, recovery and hydration formulations."),
 ("Healthy Ageing", "Formulations supporting wellness in later life."),
 ("Gut Health", "Digestive and microbiome support formulations."),
 ("Immunity", "Formulations supporting normal immune function."),
 ("Bone & Joint", "Mobility, bone and joint support formulations."),
 ("Brain Health", "Cognitive wellness and focus formulations."),
 ("Sleep & Stress", "Relaxation and stress resilience formulations."),
 ("Specialized Nutrition", "Targeted formulations for specific needs and life stages."),
]
FORMS = [
 ("Liquid-Filled Hard Capsules", "Signature Capability", "A hard-capsule format designed for compatible liquid and semi-liquid formulations."),
 ("Tablets", "", "A widely used solid dosage form across healthcare categories."),
 ("Capsules", "", "A familiar hard-capsule dosage form for suitable dry formulations."),
 ("Softgels", "", "A soft-shell format commonly used for suitable liquid or semi-liquid formulations."),
 ("Effervescent", "", "Designed for products intended to dissolve or disperse in liquid before consumption."),
 ("Sachets", "", "Flexible format for powders and other suitable formulations."),
 ("Powders", "", "A versatile format across nutrition and wellness applications."),
 ("Gummies", "", "A consumer-oriented format for selected formulations."),
 ("Liquids & Syrups", "", "Liquid delivery formats for suitable product applications."),
 ("Oral Shots", "", "Compact liquid-format products for selected applications."),
 ("Capsule-in-Capsule", "Advanced", "A specialized dosage-form concept for selected product configurations."),
 ("Pellets-in-Capsule", "Specialized", "Multiple pellets. One precisely designed capsule."),
]
ALT = {"Gut Health":"Gut & Digestive Health","Bone & Joint":"Bone & Joint Health","Brain Health":"Brain & Cognitive Health","Sleep & Stress":"Sleep & Stress Support","Sports Nutrition":"Sports & Active Nutrition","Specialized Nutrition":"Specialized Healthcare"}
LFHC_APPS = {"Daily Wellness","Men's Health","Women's Health","Beauty Nutrition","Healthy Ageing","Sports Nutrition","Specialized Nutrition"}
PACK = {
 "Tablets": "HDPE bottle 30/60/90 tablets; Alu-Alu or PVC blister strips; bulk packing on request",
 "Capsules": "HDPE bottle 30/60/90 capsules; blister strips; bulk packing on request",
 "Liquid-Filled Hard Capsules": "HDPE or amber bottle 30/60 capsules; Alu-Alu blister strips (moisture barrier)",
 "Softgels": "HDPE bottle 30/60 softgels; blister packs",
 "Effervescent": "Moisture-proof tube of 10/20 tablets; strip packs",
 "Sachets": "Single-serve sachets, carton of 10/15/30",
 "Powders": "Tub or jar 200 g to 1 kg; stand-up pouch; sachets",
 "Gummies": "PET jar 30/60 gummies; pouch packs",
 "Liquids & Syrups": "PET or amber bottle 100/200 ml; dosing cup/spoon",
 "Oral Shots": "10-30 ml shot bottles or ampoules; carton of 10/30",
 "Capsule-in-Capsule": "HDPE bottle 30/60 capsules; Alu-Alu blister strips",
 "Pellets-in-Capsule": "HDPE bottle 30/60 capsules; blister strips",
}

def slug(s):
    s = s.lower().replace("&", "and").replace("+", "plus")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

P = []
def add(name, cat, form, comp, featured=False, note=None):
    comp = [dict(ingredient=i, strength=s, purpose=p) for i, s, p in comp]
    purposes = []
    for c in comp:
        if c["purpose"] not in purposes:
            purposes.append(c["purpose"])
    names = [c["ingredient"] for c in comp]
    joined = names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]
    short = f"{name}: a {form.lower()} format formulation for the {cat.lower()} range."
    desc = (f"{name} combines {joined} in a {form.lower()} format, designed for the {cat.lower()} range. "
            f"Available for private label, contract manufacturing and custom formulation. "
            f"Final composition, strengths and claims are confirmed during product development.")
    P.append(dict(
        name=name, slug=slug(name), dosageForm=form, healthCategory=cat,
        categories=[cat, form], shortDescription=short, description=desc,
        composition=comp, benefits=[f"Supports {p}" for p in purposes[:4]],
        packaging=PACK[form], moq="On request", featured=featured, images=[f"/uploads/products/{slug(name)}.webp"],
        status="draft", contentStatus="needs_review", claimsReviewed=False,
        reviewNote=note or "Verify strengths, permitted claims and labelling per target market regulations.",
        seo=dict(title=f"{name} | Private Label & Contract Manufacturing | ONPHARNO"[:60],
                 description=f"{name} in {form.lower()} format. Private label and contract manufacturing by ONPHARNO."[:160],
                 keywords=", ".join([name.lower(), cat.lower(), form.lower(), "private label", "contract manufacturing"])),
        source=dict(type="generic-reference", urls=[], retrievedAt=TODAY),
    ))

DW, MH, WH, BN, SN, HA, GH, IM, BJ, BR, SS, SP = [h[0] for h in HEALTH]
# Daily Wellness
add("Multivitamin & Multimineral Tablets", DW, "Tablets", [("Vitamin C","80 mg","immune health"),("Vitamin D3","400 IU","bone health"),("Vitamin B12","2.4 mcg","energy metabolism"),("Zinc","10 mg","normal immune function"),("Magnesium","100 mg","muscle function")])
add("B-Complex with Vitamin C Tablets", DW, "Tablets", [("Vitamin B1 (Thiamine)","10 mg","energy metabolism"),("Vitamin B2 (Riboflavin)","10 mg","energy metabolism"),("Vitamin B3 (Niacinamide)","45 mg","normal nervous system function"),("Vitamin B6","3 mg","normal protein metabolism"),("Vitamin B12","15 mcg","red blood cell formation"),("Vitamin C","150 mg","antioxidant protection")])
add("Vitamin D3 60,000 IU Liquid-Filled Capsules", DW, "Liquid-Filled Hard Capsules", [("Cholecalciferol (Vitamin D3)","60,000 IU","bone and muscle health")], featured=True, note="High-dose weekly format: confirm permitted dose and labelling for each market.")
add("Omega-3 Fish Oil Softgels", DW, "Softgels", [("Fish oil concentrate","1000 mg","heart health"),("EPA","180 mg","heart health"),("DHA","120 mg","brain and eye health")])
add("Iron, Folic Acid & B12 Tablets", DW, "Tablets", [("Elemental iron (as iron bisglycinate)","30 mg","healthy blood formation"),("Folic acid","400 mcg","red blood cell formation"),("Vitamin B12","5 mcg","energy metabolism")])
add("Electrolyte Energy Sachets", DW, "Sachets", [("Sodium","200 mg","hydration balance"),("Potassium","120 mg","hydration balance"),("Vitamin C","60 mg","antioxidant protection")])
# Men's Health
add("Shilajit Extract Capsules", MH, "Capsules", [("Shilajit extract (standardized fulvic acid)","250 mg","vitality and stamina")])
add("Ashwagandha & Safed Musli Capsules", MH, "Capsules", [("Ashwagandha root extract","300 mg","stress resilience"),("Safed musli extract","300 mg","vitality and stamina")])
add("Zinc, Selenium & Lycopene Softgels", MH, "Softgels", [("Zinc","15 mg","men's wellness"),("Selenium","55 mcg","antioxidant protection"),("Lycopene","10 mg","antioxidant protection")])
add("Saw Palmetto Extract Capsules", MH, "Capsules", [("Saw palmetto extract","320 mg","prostate wellness")], note="Claim-sensitive: confirm permitted wording per market.")
add("Tribulus Terrestris Tablets", MH, "Tablets", [("Tribulus terrestris extract (40% saponins)","500 mg","stamina and performance")])
add("Men's Daily Multivitamin Gummies", MH, "Gummies", [("Vitamin D3","400 IU","bone health"),("Zinc","8 mg","normal immune function"),("Vitamin B6","1.7 mg","energy metabolism"),("Vitamin B12","2.4 mcg","energy metabolism")])
# Women's Health
add("Shatavari Extract Capsules", WH, "Capsules", [("Shatavari root extract","500 mg","women's wellness")])
add("Iron Bisglycinate & Vitamin C Capsules", WH, "Capsules", [("Iron (as bisglycinate)","30 mg","healthy blood formation"),("Vitamin C","80 mg","iron absorption support")])
add("Myo-Inositol & D-Chiro Inositol Sachets", WH, "Sachets", [("Myo-inositol","2000 mg","hormonal balance wellness"),("D-chiro inositol","50 mg","hormonal balance wellness")], note="Claim-sensitive: avoid condition-specific claims.")
add("Evening Primrose Oil Softgels", WH, "Softgels", [("Evening primrose oil (9% GLA)","1000 mg","women's wellness")])
add("Prenatal Multivitamin Softgels", WH, "Softgels", [("Folic acid","400 mcg","prenatal nutrition"),("Iron","27 mg","healthy blood formation"),("DHA","200 mg","brain and eye development"),("Vitamin D3","400 IU","bone health")], note="Prenatal products: strict regulatory and labelling review required.")
add("Cranberry & D-Mannose Capsules", WH, "Capsules", [("Cranberry extract","500 mg","urinary tract health"),("D-mannose","500 mg","urinary tract health")])
# Beauty Nutrition
add("Hydrolyzed Collagen Peptides Sachets", BN, "Sachets", [("Hydrolyzed collagen peptides","5000 mg","skin elasticity"),("Vitamin C","40 mg","collagen formation")])
add("Biotin 10,000 mcg Tablets", BN, "Tablets", [("Biotin","10,000 mcg","hair, skin and nail health")])
add("Hyaluronic Acid & Vitamin C Capsules", BN, "Capsules", [("Hyaluronic acid","100 mg","skin hydration"),("Vitamin C","100 mg","antioxidant protection")])
add("Glutathione & Vitamin C Effervescent Tablets", BN, "Effervescent", [("Reduced glutathione","250 mg","antioxidant support"),("Vitamin C","500 mg","antioxidant protection")], note="Avoid skin-lightening claims; not permitted in many markets.")
add("Hair, Skin & Nails Gummies", BN, "Gummies", [("Biotin","5000 mcg","hair, skin and nail health"),("Zinc","5 mg","normal skin function"),("Vitamin C","40 mg","antioxidant protection")])
add("Marine Collagen Oral Shots", BN, "Oral Shots", [("Marine collagen peptides","5000 mg","skin elasticity"),("Hyaluronic acid","50 mg","skin hydration"),("Vitamin C","60 mg","antioxidant protection")])
add("Vitamin E 400 IU Liquid-Filled Capsules", BN, "Liquid-Filled Hard Capsules", [("d-Alpha tocopherol (Vitamin E)","400 IU","antioxidant protection")], featured=True)
# Sports Nutrition
add("Creatine Monohydrate Powder", SN, "Powders", [("Creatine monohydrate","5 g per serving","strength and performance")])
add("BCAA 2:1:1 Powder", SN, "Powders", [("BCAA (leucine:isoleucine:valine 2:1:1)","5 g per serving","muscle recovery")])
add("Whey Protein Isolate Powder", SN, "Powders", [("Whey protein isolate","approx. 24 g protein per 30 g serving","muscle growth and repair")])
add("Electrolyte Hydration Effervescent Tablets", SN, "Effervescent", [("Sodium","300 mg","hydration balance"),("Potassium","150 mg","hydration balance"),("Magnesium","40 mg","muscle function"),("Vitamin C","100 mg","antioxidant protection")])
add("L-Glutamine Powder", SN, "Powders", [("L-glutamine","5 g per serving","muscle recovery")])
add("Beta-Alanine & Citrulline Malate Capsules", SN, "Capsules", [("Beta-alanine","800 mg","endurance"),("L-citrulline malate","1000 mg","exercise performance")])
# Healthy Ageing
add("Coenzyme Q10 100 mg Liquid-Filled Capsules", HA, "Liquid-Filled Hard Capsules", [("Coenzyme Q10 (ubiquinone)","100 mg","cellular energy")], featured=True)
add("Resveratrol Capsules", HA, "Capsules", [("Trans-resveratrol","100 mg","antioxidant protection")])
add("Lutein & Zeaxanthin Softgels", HA, "Softgels", [("Lutein","10 mg","eye health"),("Zeaxanthin","2 mg","eye health")])
add("Methylcobalamin 1500 mcg Tablets", HA, "Tablets", [("Methylcobalamin (Vitamin B12)","1500 mcg","nervous system health")])
add("Senior Multivitamin 50+ Tablets", HA, "Tablets", [("Vitamin D3","800 IU","bone health"),("Vitamin B12","25 mcg","energy metabolism"),("Calcium","200 mg","bone health"),("Zinc","10 mg","normal immune function")])
add("Alpha Lipoic Acid & Acetyl-L-Carnitine Capsules", HA, "Capsules", [("Alpha lipoic acid","200 mg","antioxidant protection"),("Acetyl-L-carnitine","500 mg","cellular energy")])
# Gut Health
add("Multi-Strain Probiotic 10 Billion CFU Capsules", GH, "Capsules", [("Probiotic blend (Lactobacillus and Bifidobacterium strains)","10 billion CFU","gut microbiome balance")])
add("Prebiotic Inulin Sachets", GH, "Sachets", [("Inulin (chicory root fibre)","5 g","digestive health")])
add("Digestive Enzyme Capsules", GH, "Capsules", [("Digestive enzyme blend (protease, lipase, amylase)","300 mg","digestion")])
add("Psyllium Husk Powder", GH, "Powders", [("Psyllium husk","5 g per serving","regularity")])
add("Triphala Extract Tablets", GH, "Tablets", [("Triphala extract","500 mg","digestive wellness")])
add("Zinc Carnosine & L-Glutamine Capsules", GH, "Capsules", [("Zinc carnosine","75 mg","gut lining support"),("L-glutamine","500 mg","gut lining support")])
add("Digestive Enzyme Pellets-in-Capsule", GH, "Pellets-in-Capsule", [("Enteric-coated enzyme pellets","300 mg","digestion")], featured=True)
# Immunity
add("Vitamin C 1000 mg & Zinc Effervescent Tablets", IM, "Effervescent", [("Vitamin C","1000 mg","immune health"),("Zinc","10 mg","normal immune function")])
add("Giloy (Tinospora cordifolia) Extract Tablets", IM, "Tablets", [("Giloy stem extract","500 mg","immune wellness")])
add("Elderberry Immunity Gummies", IM, "Gummies", [("Elderberry extract","150 mg","immune health"),("Vitamin C","45 mg","immune health"),("Zinc","5 mg","normal immune function")])
add("Beta-Glucan & Vitamin D3 Capsules", IM, "Capsules", [("Beta-glucan","250 mg","immune health"),("Vitamin D3","1000 IU","normal immune function")])
add("Quercetin & Vitamin C Capsules", IM, "Capsules", [("Quercetin","250 mg","antioxidant protection"),("Vitamin C","250 mg","immune health")])
add("Amla, Vitamin C & Zinc Oral Shots", IM, "Oral Shots", [("Amla extract","500 mg","antioxidant protection"),("Vitamin C","60 mg","immune health"),("Zinc","5 mg","normal immune function")])
add("Vitamin C & Zinc Capsule-in-Capsule", IM, "Capsule-in-Capsule", [("Vitamin C (inner capsule)","250 mg","immune health"),("Zinc (outer capsule)","10 mg","normal immune function")], featured=True)
# Bone & Joint
add("Calcium, Vitamin D3 & K2 Tablets", BJ, "Tablets", [("Calcium","500 mg","bone health"),("Vitamin D3","250 IU","calcium absorption"),("Vitamin K2 (MK-7)","45 mcg","bone health")])
add("Glucosamine, Chondroitin & MSM Tablets", BJ, "Tablets", [("Glucosamine sulfate","750 mg","joint comfort"),("Chondroitin sulfate","600 mg","joint comfort"),("MSM","500 mg","joint comfort")])
add("Undenatured Collagen Type II Capsules", BJ, "Capsules", [("Undenatured type II collagen","40 mg","joint flexibility")])
add("Curcumin with Piperine Liquid-Filled Capsules", BJ, "Liquid-Filled Hard Capsules", [("Curcumin (95% curcuminoids)","500 mg","joint comfort"),("Piperine","5 mg","curcumin absorption")], featured=True)
add("Calcium & Vitamin D3 Oral Suspension", BJ, "Liquids & Syrups", [("Calcium","250 mg per 5 ml","bone health"),("Vitamin D3","200 IU per 5 ml","calcium absorption")])
add("Collagen & Glucosamine Joint Sachets", BJ, "Sachets", [("Collagen peptides","5000 mg","joint comfort"),("Glucosamine","750 mg","joint comfort")])
add("Vitamin K2 (MK-7) 100 mcg Liquid-Filled Capsules", BJ, "Liquid-Filled Hard Capsules", [("Menaquinone-7 (Vitamin K2)","100 mcg","bone health")], featured=True)
# Brain Health
add("Bacopa Monnieri Extract Capsules", BR, "Capsules", [("Bacopa monnieri extract (50% bacosides)","300 mg","memory and focus")])
add("Alpha-GPC Capsules", BR, "Capsules", [("Alpha-GPC","300 mg","cognitive function")])
add("Lion's Mane Mushroom Extract Capsules", BR, "Capsules", [("Lion's mane mushroom extract","500 mg","cognitive wellness")])
add("Ginkgo Biloba Extract Tablets", BR, "Tablets", [("Ginkgo biloba extract (24% flavone glycosides)","120 mg","memory and circulation")])
add("Phosphatidylserine & DHA Softgels", BR, "Softgels", [("Phosphatidylserine","100 mg","cognitive function"),("DHA","250 mg","brain health")])
add("Brahmi & Shankhpushpi Syrup", BR, "Liquids & Syrups", [("Brahmi extract","300 mg per 10 ml","memory and focus"),("Shankhpushpi extract","200 mg per 10 ml","mental wellness")])
# Sleep & Stress
add("Ashwagandha Root Extract Capsules", SS, "Capsules", [("Ashwagandha root extract (5% withanolides)","300 mg","stress resilience")])
add("L-Theanine 200 mg Capsules", SS, "Capsules", [("L-theanine","200 mg","relaxation")])
add("Magnesium Glycinate Tablets", SS, "Tablets", [("Magnesium (as glycinate)","200 mg","relaxation and muscle function")])
add("Valerian & Passionflower Capsules", SS, "Capsules", [("Valerian root extract","300 mg","restful sleep"),("Passionflower extract","200 mg","relaxation")])
add("Calm & Relax Gummies", SS, "Gummies", [("L-theanine","100 mg","relaxation"),("Magnesium","50 mg","relaxation and muscle function"),("Chamomile extract","50 mg","calm")])
add("Ashwagandha & L-Theanine Oral Shots", SS, "Oral Shots", [("Ashwagandha extract","150 mg","stress resilience"),("L-theanine","100 mg","relaxation"),("Vitamin B6","1.4 mg","normal nervous system function")])
# Specialized Nutrition
add("Kids Multivitamin Gummies", SP, "Gummies", [("Vitamin C","40 mg","immune health"),("Vitamin D3","200 IU","bone health"),("Zinc","3 mg","normal immune function"),("Vitamin B12","1.2 mcg","energy metabolism")], note="Paediatric product: age-specific dosing and regulatory review required.")
add("Adult Oral Nutrition Powder", SP, "Powders", [("Protein blend","approx. 15 g per 50 g serving","nutritional support"),("Vitamin and mineral premix","per regulation","nutritional support")], note="Confirm whether classified as supplement or food for special medical purposes.")
add("Glucose Metabolism Support Tablets", SP, "Tablets", [("Chromium picolinate","200 mcg","healthy glucose metabolism"),("Bitter melon extract","500 mg","healthy glucose metabolism"),("Cinnamon extract","250 mg","healthy glucose metabolism")], note="High claim sensitivity: avoid disease or treatment claims.")
add("Electrolyte Rehydration Powder Sachets", SP, "Powders", [("Sodium","per regulation","hydration"),("Potassium","per regulation","hydration"),("Glucose","per regulation","fluid absorption")], note="May be regulated as a medical or special-purpose product in some markets.")
add("Paediatric Iron & Folic Acid Syrup", SP, "Liquids & Syrups", [("Elemental iron (iron polymaltose)","20 mg per 5 ml","healthy blood formation"),("Folic acid","100 mcg per 5 ml","red blood cell formation")], note="Paediatric product: strict dosing and regulatory review required.")
add("Vegan Algal DHA Capsules", SP, "Softgels", [("Algal DHA oil","250 mg","brain and eye health")])


# --- Featured collections (client spec: Liquid-Filled, Capsule-in-Capsule, Pellets-in-Capsule) ---
add("Vitamin D3 & K2 Liquid-Filled Capsules", DW, "Liquid-Filled Hard Capsules", [("Cholecalciferol (Vitamin D3)","2000 IU","bone health"),("Menaquinone-7 (Vitamin K2)","90 mcg","bone health")], featured=True)
add("Pumpkin Seed Oil & Lycopene Liquid-Filled Capsules", MH, "Liquid-Filled Hard Capsules", [("Pumpkin seed oil","500 mg","men's wellness"),("Lycopene","10 mg","antioxidant protection")], featured=True)
add("Evening Primrose & Vitamin E Liquid-Filled Capsules", WH, "Liquid-Filled Hard Capsules", [("Evening primrose oil (9% GLA)","500 mg","women's wellness"),("Vitamin E","10 mg","antioxidant protection")], featured=True)
add("MCT Oil Liquid-Filled Capsules", SN, "Liquid-Filled Hard Capsules", [("Medium-chain triglycerides (C8/C10)","1000 mg","sustained energy")], featured=True)
add("Lutein & Astaxanthin Liquid-Filled Capsules", HA, "Liquid-Filled Hard Capsules", [("Lutein","10 mg","eye health"),("Astaxanthin","4 mg","antioxidant protection")], featured=True)
add("Vegan Algal DHA Liquid-Filled Capsules", SP, "Liquid-Filled Hard Capsules", [("Algal DHA oil","250 mg","brain and eye health")], featured=True)
add("Probiotic & Prebiotic Capsule-in-Capsule", GH, "Capsule-in-Capsule", [("Probiotic blend (inner capsule)","5 billion CFU","gut microbiome balance"),("Inulin (outer capsule)","250 mg","digestive health")], featured=True)
add("Iron & Vitamin C Capsule-in-Capsule", WH, "Capsule-in-Capsule", [("Iron bisglycinate (inner capsule)","30 mg","healthy blood formation"),("Vitamin C (outer capsule)","80 mg","iron absorption support")], featured=True)
add("Multivitamin Pellets-in-Capsule", DW, "Pellets-in-Capsule", [("Vitamin C (coated pellets)","80 mg","immune health"),("Vitamin B12 (pellets)","2.4 mcg","energy metabolism"),("Zinc (pellets)","10 mg","normal immune function")], featured=True)
add("Vitamin C Sustained-Release Pellets-in-Capsule", IM, "Pellets-in-Capsule", [("Vitamin C (sustained-release pellets)","500 mg","immune health")], featured=True)
add("Magnesium & Vitamin B6 Pellets-in-Capsule", SS, "Pellets-in-Capsule", [("Magnesium (pellets)","100 mg","relaxation and muscle function"),("Vitamin B6 (pellets)","1.4 mg","normal nervous system function")], featured=True)

# integrity
slugs = [p["slug"] for p in P]
assert len(slugs) == len(set(slugs)), "duplicate slug"

with open(f"{OUT}/products.json", "w", encoding="utf-8") as f:
    json.dump(P, f, indent=2, ensure_ascii=False)

cats = [dict(name=n, slug=slug(n), type="health_category", description=d, altName=ALT.get(n, ""), showOnLiquidFilledPage=(n in LFHC_APPS), order=i+1, active=True, image=f"/uploads/categories/{slug(n)}.webp") for i,(n,d) in enumerate(HEALTH)]
cats += [dict(name=n, slug=slug(n), type="dosage_form", description=d, badge=b, featured=bool(b), order=i+1, active=True, image=f"/uploads/categories/{slug(n)}.webp") for i,(n,b,d) in enumerate(FORMS)]
with open(f"{OUT}/categories.json", "w", encoding="utf-8") as f:
    json.dump(cats, f, indent=2, ensure_ascii=False)

cols = ["name","slug","healthCategory","dosageForm","shortDescription","description","composition","benefits","packaging","moq","featured","status","contentStatus","claimsReviewed","reviewNote","seoTitle","seoDescription","seoKeywords","sourceType","images"]
with open(f"{OUT}/products.csv", "w", newline="", encoding="utf-8-sig") as f:
    w = csv.writer(f); w.writerow(cols)
    for p in P:
        w.writerow([p["name"],p["slug"],p["healthCategory"],p["dosageForm"],p["shortDescription"],p["description"],
                    " | ".join(f'{c["ingredient"]}::{c["strength"]}::{c["purpose"]}' for c in p["composition"]),
                    " | ".join(p["benefits"]),p["packaging"],p["moq"],p["featured"],p["status"],p["contentStatus"],p["claimsReviewed"],
                    p["reviewNote"],p["seo"]["title"],p["seo"]["description"],p["seo"]["keywords"],p["source"]["type"],p["images"][0]])
print(len(P), "products;", len(cats), "categories/forms")
from collections import Counter
print(Counter(p["healthCategory"] for p in P))
print(Counter(p["dosageForm"] for p in P))
