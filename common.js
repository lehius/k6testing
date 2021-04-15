export const getRandomValueAndRound = (min, max) => {
  return Math.round((Math.random()*(max-min))+min);
}
export const getRandomValueAndFloor = (min, max) => {
  return Math.floor((Math.random()*(max-min))+min);
}
export const getByID = (array, id) => {
  for (let idx = 0; idx < array.length; idx++) {
    console.log(`array.id: ${array[idx].id}, id: ${id}`);
    if (array[idx].id === id) {
      return array[idx];
    }
  }
  return void 0;
}
export const incrementTimeout = (function() {
  let timeout = 0;
  return function(min, max) {
    timeout = timeout + getRandomValueAndRound(min, max);
    return timeout;
  }
})()

export const ConnectionsCount = (function() {
  let count = 0;
  let instance = null;
  return function ConnectionsCountConstructor() {
    if (instance) {
      return instance;
    } else if (this && this.constructor === ConnectionsCountConstructor) {
      instance = this;
    } else {
      return new ConnectionsCountConstructor();
    }
    this.getCount = () => count;
    this.increment = () => {
      count++;
      return count;
    }
    this.decrement = () => {
      count--;
      return count;
    }
  }
})();
const getServices = (root) => {
  const result = [];
  if (root.services) {
    root.services.forEach((service) => {
      result.push(service.id);
    })
  }
  if (root.children) {
    root.children.forEach(child => {
      getServices(child).forEach(id => {
        result.push(id)
      });
    });
  }
  return result;
}

export const getServicesFromServiceGroupList = (serviceGroupList) => {
  return serviceGroupList.reduce((acc, item) => {
    acc[item.id] = getServices(item.root);
    return acc;
  }, {})
}

export const composeCommandsForNext = (commands, suffix = '') => {
  let result = [];
  for (let command in commands) {
    if (commands[command].chance) {
      result.push({command: command+suffix, chance: commands[command].chance})
    }
  }
  return result;
}

export const chooseNextCommand = commands => {
  const chance = Math.random()*100;
  let chanceFrom = 0;
  let chanceTo = 0;
  for (let idx in commands) {
    chanceTo += commands[idx].chance;
    if (chance > chanceFrom && chance <= chanceTo) {
      return commands[idx].command;
    }
  }
  return commands[Math.floor(Math.random()*commans.length)].command;
}
