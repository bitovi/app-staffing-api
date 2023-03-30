import { Scaffold } from "bitscaffold";

const seedData = (scaffold: Scaffold) => {
    scaffold.models[]
};

async function createSkills (scaffold: Scaffold) {
    const skillList = [
      { name: 'Product Design' },
      { name: 'Project Management' },
      { name: 'React' },
      { name: 'Angular' },
      { name: 'Backend' },
      { name: 'DevOps' }
    ]
    const skills = await scaffold.model['Skill'].bulkCreate(skillList);
    const idList: Array<string> = []
    skills.forEach((e: any) => {
      idList.push(e.id)
    })
    return idList
  }