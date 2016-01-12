import {
  EventEmitter,ImmutableQuery,AccessorManager,
  SearchkitManager, PageSizeAccessor, ValueState, PaginationAccessor
} from "../../"

describe("AccessorManager", ()=> {

  beforeEach(()=> {
    this.searchkit = new SearchkitManager("/", {useHistory:false})

    this.accessor1 = new PaginationAccessor("p1")
    this.accessor2 = new PaginationAccessor("p2")
    this.searchkit.addAccessor(this.accessor1)
    this.searchkit.addAccessor(this.accessor2)

    this.accessor3 = new PaginationAccessor("p3")
    this.accessor4 = new PaginationAccessor("p4")
    this.searchkit.addAccessor(this.accessor3)
    this.searchkit.addAccessor(this.accessor4)

    this.accessor5 = new PageSizeAccessor(50)
    this.searchkit.addAccessor(this.accessor5)
    this.accessors = this.searchkit.accessors
  })

  it("constructor()", ()=> {
    expect(this.accessors.accessors).toEqual([
      this.accessor1, this.accessor2,
      this.accessor3, this.accessor4,
      this.accessor5
    ])
    expect(new AccessorManager().accessors)
      .toEqual([])
  })

  it("getAccessors()", ()=> {
    expect(this.accessors.getAccessors()).toEqual([
      this.accessor1, this.accessor2,
      this.accessor3, this.accessor4, this.accessor5
    ])
  })

  it("getStatefulAccessors()", ()=> {
    expect(this.accessors.getStatefulAccessors()).toEqual([
      this.accessor1, this.accessor2,
      this.accessor3, this.accessor4
    ])
  })

  it("add()", ()=> {
    let accessors = new AccessorManager()
    expect(accessors.add(this.accessor1))
      .toEqual(this.accessor1)
    expect(accessors.getAccessors())
      .toEqual([this.accessor1])
  })


  it("getState()", ()=> {
    this.accessor1.state = new ValueState("a1state")
    this.accessor4.state = new ValueState("a4state")
    expect(this.accessors.getState()).toEqual({
      p1:"a1state", p4:"a4state"
    })
  })

  it("setState()", ()=> {
    this.accessors.setState({
      p2:"a2state", p3:"a3state"})
    expect(this.accessor1.state.getValue()).toBe(null)
    expect(this.accessor2.state.getValue()).toBe("a2state")
    expect(this.accessor3.state.getValue()).toBe("a3state")
    expect(this.accessor4.state.getValue()).toBe(null)
  })

  it("notifyStateChange", ()=> {
    let stateChanges = []
    let oldState = {}
    spyOn(PaginationAccessor.prototype, "onStateChange")
    this.accessors.notifyStateChange(oldState)
    expect(PaginationAccessor.prototype.onStateChange)
      .toHaveBeenCalledWith(oldState)
    expect(PaginationAccessor.prototype.onStateChange["calls"].count())
      .toBe(4)
  })


  it("buildSharedQuery()", ()=> {
    let query = new ImmutableQuery()
    let sharedQuery = this.accessors.buildSharedQuery(query)
    expect(query).toBe(sharedQuery)
    this.accessor1.buildSharedQuery = function(query){
      return query.setSize(25)
    }
    let newSharedQuery = this.accessors.buildSharedQuery(query)
    expect(newSharedQuery).not.toBe(query)
    expect(newSharedQuery.getSize()).toBe(25)
  })

  it("buildQuery()", ()=> {
    let query = new ImmutableQuery()
    query = this.accessors.buildQuery(query)
    expect(query.getSize()).toBe(50)
  })

  it("setResults()", ()=> {
    this.accessors.setResults("someResults")
    expect(this.accessor1.results).toBe("someResults")
    expect(this.accessor4.results).toBe("someResults")
  })


  it("resetState()", ()=> {
    this.accessor1.state = new ValueState("a1state")
    this.accessor3.state = new ValueState("a3state")
    this.accessors.resetState()
    expect(this.accessor1.state.getValue()).toBe(null)
    expect(this.accessor3.state.getValue()).toBe(null)
  })
})